-- Adiciona a coluna de prioridade na tabela de ordens de serviço
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'Média';

-- Atualiza as ordens existentes para terem prioridade Média
UPDATE public.orders SET priority = 'Média' WHERE priority IS NULL;
