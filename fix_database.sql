-- Execute este comando no SQL Editor do Supabase para corrigir o erro
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS "createdBy" TEXT;

-- Forçar atualização do cache do schema (opcional, mas bom pra garantir)
NOTIFY pgrst, 'reload config';
