-- Adiciona coluna de imagem
ALTER TABLE public.inventory 
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Cria tabela de logs de movimentação
CREATE TABLE IF NOT EXISTS public.inventory_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inventory_id UUID REFERENCES public.inventory(id) ON DELETE CASCADE,
    type TEXT NOT NULL, -- 'entry', 'exit', 'adjustment'
    quantity INTEGER NOT NULL,
    prev_stock INTEGER,
    new_stock INTEGER,
    order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
    user_name TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS para logs
ALTER TABLE public.inventory_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable all for authenticated users" ON public.inventory_logs
    FOR ALL USING (auth.role() = 'authenticated');
