-- Tabela de Catálogo de Itens e Estoque
CREATE TABLE IF NOT EXISTS public.inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    category TEXT NOT NULL, -- 'Equipamento', 'Material', 'Ferramenta'
    description TEXT,
    unit TEXT DEFAULT 'unid', -- 'unid', 'metros', 'kits'
    current_stock INTEGER DEFAULT 0,
    min_stock INTEGER DEFAULT 5,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabela para registrar o uso de itens em Ordens de Serviço
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    inventory_id UUID REFERENCES public.inventory(id),
    quantity INTEGER NOT NULL DEFAULT 1,
    serial_number TEXT, -- Opcional para rastrear ONUs/Roteadores específicos
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Políticas simples para todos
CREATE POLICY "Allow all for inventory" ON public.inventory FOR ALL USING (true);
CREATE POLICY "Allow all for order_items" ON public.order_items FOR ALL USING (true);

-- Dados iniciais de exemplo (opcional)
INSERT INTO public.inventory (name, category, description, current_stock, min_stock)
VALUES 
('ONU Huawei EG8145V5', 'Equipamento', 'ONU Dual Band AC', 50, 10),
('Roteador Intelbras RF1200', 'Equipamento', 'Roteador Wi-Fi 5', 30, 5),
('Cabo Drop (Metros)', 'Material', 'Cabo óptico flat', 1000, 200),
('Conector Fast APC', 'Material', 'Conector de campo', 200, 50);
