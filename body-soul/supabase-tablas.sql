-- =============================================
-- BODY & SOUL – Script de tablas para Supabase
-- Pega esto en Supabase → SQL Editor → Run
-- =============================================

-- 1. PERFILES DE USUARIO (extiende la auth de Supabase)
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  nombre text not null,
  email text not null,
  avatar_letra text,
  -- Ficha de salud
  condiciones_fisicas text[] default '{}',
  enfermedades text[] default '{}',
  nivel_experiencia text default 'principiante',
  notas_salud text,
  -- Control
  es_admin boolean default false,
  created_at timestamp with time zone default now()
);

-- 2. CLASES
create table clases (
  id uuid default gen_random_uuid() primary key,
  nombre text not null,
  tipo text not null, -- 'flow' | 'restaurativo' | 'power' | 'meditacion'
  fecha date not null,
  hora time not null,
  duracion_minutos integer default 60,
  plazas_maximas integer default 12,
  google_calendar_event_id text,
  created_at timestamp with time zone default now()
);

-- 3. INSCRIPCIONES
create table inscripciones (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade,
  clase_id uuid references clases(id) on delete cascade,
  estado text default 'confirmada', -- 'confirmada' | 'cancelada'
  created_at timestamp with time zone default now(),
  unique(user_id, clase_id)
);

-- 4. LISTA DE ESPERA
create table lista_espera (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade,
  clase_id uuid references clases(id) on delete cascade,
  posicion integer not null,
  notificada boolean default false,
  created_at timestamp with time zone default now(),
  unique(user_id, clase_id)
);

-- 5. ENCUESTAS
create table encuestas (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade,
  clase_id uuid references clases(id) on delete cascade,
  estrellas integer check (estrellas between 1 and 5),
  sensacion text,
  comentario text,
  recomendaria boolean,
  created_at timestamp with time zone default now(),
  unique(user_id, clase_id)
);

-- =============================================
-- VISTAS ÚTILES
-- =============================================

-- Plazas disponibles por clase
create view clases_con_plazas as
select
  c.*,
  count(i.id) filter (where i.estado = 'confirmada') as inscritas,
  c.plazas_maximas - count(i.id) filter (where i.estado = 'confirmada') as plazas_libres,
  count(le.id) as en_espera
from clases c
left join inscripciones i on i.clase_id = c.id
left join lista_espera le on le.clase_id = c.id
group by c.id;

-- Clases usadas por usuario este mes
create view clases_mes_actual as
select
  i.user_id,
  count(*) as clases_usadas
from inscripciones i
join clases c on c.id = i.clase_id
where
  i.estado = 'confirmada'
  and date_trunc('month', c.fecha) = date_trunc('month', current_date)
group by i.user_id;

-- =============================================
-- SEGURIDAD (Row Level Security)
-- =============================================

alter table profiles enable row level security;
alter table clases enable row level security;
alter table inscripciones enable row level security;
alter table lista_espera enable row level security;
alter table encuestas enable row level security;

-- Profiles: cada usuaria ve solo la suya (admin ve todas)
create policy "Ver propio perfil" on profiles for select using (auth.uid() = id);
create policy "Editar propio perfil" on profiles for update using (auth.uid() = id);

-- Clases: todas pueden ver, solo admin puede crear/editar
create policy "Ver clases" on clases for select using (true);
create policy "Admin gestiona clases" on clases for all
  using (exists (select 1 from profiles where id = auth.uid() and es_admin = true));

-- Inscripciones: cada usuaria ve y gestiona las suyas
create policy "Ver propias inscripciones" on inscripciones for select using (auth.uid() = user_id);
create policy "Inscribirse" on inscripciones for insert with check (auth.uid() = user_id);
create policy "Cancelar inscripcion" on inscripciones for update using (auth.uid() = user_id);

-- Lista espera: igual
create policy "Ver propia espera" on lista_espera for select using (auth.uid() = user_id);
create policy "Apuntarse espera" on lista_espera for insert with check (auth.uid() = user_id);
create policy "Salir espera" on lista_espera for delete using (auth.uid() = user_id);

-- Encuestas: cada usuaria gestiona las suyas
create policy "Ver propias encuestas" on encuestas for select using (auth.uid() = user_id);
create policy "Crear encuesta" on encuestas for insert with check (auth.uid() = user_id);

-- =============================================
-- FUNCIÓN: promover lista de espera
-- Se ejecuta cuando alguien cancela su plaza
-- =============================================

create or replace function promover_lista_espera()
returns trigger as $$
declare
  siguiente_user uuid;
begin
  -- Encontrar el primero en lista de espera
  select user_id into siguiente_user
  from lista_espera
  where clase_id = old.clase_id
  order by posicion asc
  limit 1;

  if siguiente_user is not null then
    -- Inscribir al siguiente
    insert into inscripciones (user_id, clase_id, estado)
    values (siguiente_user, old.clase_id, 'confirmada')
    on conflict (user_id, clase_id) do update set estado = 'confirmada';

    -- Marcarle como notificada
    update lista_espera
    set notificada = true
    where user_id = siguiente_user and clase_id = old.clase_id;

    -- Eliminarle de la lista de espera
    delete from lista_espera
    where user_id = siguiente_user and clase_id = old.clase_id;
  end if;

  return old;
end;
$$ language plpgsql security definer;

-- Trigger: cuando se cancela una inscripción, promover lista de espera
create trigger on_cancelar_inscripcion
  after update of estado on inscripciones
  for each row
  when (new.estado = 'cancelada' and old.estado = 'confirmada')
  execute function promover_lista_espera();
