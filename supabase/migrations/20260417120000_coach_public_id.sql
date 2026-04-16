-- Run on the virtual-receptionist Supabase project only.
-- Opaque public URL segment for each agent (separate from human slug).

alter table public.virtual_receptionists
  add column if not exists coach_public_id text;

create unique index if not exists virtual_receptionists_coach_public_id_key
  on public.virtual_receptionists (coach_public_id)
  where coach_public_id is not null;

-- Backfill rows with NULL coach_public_id (retries if collision).
do $$
declare
  r record;
  new_id text;
  attempts int;
  chars text := 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  i int;
  b int;
begin
  for r in select id from public.virtual_receptionists where coach_public_id is null loop
    attempts := 0;
    loop
      new_id := '';
      for i in 1..12 loop
        b := floor(random() * 62)::int + 1;
        new_id := new_id || substr(chars, b, 1);
      end loop;
      exit when not exists (
        select 1 from public.virtual_receptionists v where v.coach_public_id = new_id
      );
      attempts := attempts + 1;
      if attempts > 100 then
        raise exception 'Could not generate unique coach_public_id for id %', r.id;
      end if;
    end loop;
    update public.virtual_receptionists
      set coach_public_id = new_id
      where id = r.id;
  end loop;
end $$;

alter table public.virtual_receptionists
  alter column coach_public_id set not null;
