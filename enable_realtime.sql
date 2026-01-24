-- Execute este comando no SQL Editor do seu projeto Supabase para ativar o Realtime

-- 1. Habilitar a replicação para a tabela orders
ALTER TABLE public.orders REPLICA IDENTITY FULL;

-- 2. Adicionar a tabela orders à publicação realtime
BEGIN;
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime FOR TABLE public.orders;
COMMIT;

-- OU se a publicação já existir e tiver outras tabelas:
-- ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
