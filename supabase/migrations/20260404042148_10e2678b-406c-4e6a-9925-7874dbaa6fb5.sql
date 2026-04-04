
-- Deactivate duplicate demos (keeping one per unique image mapping)

-- APLICATIVO: Remove duplicates
UPDATE public.project_demos SET is_active = false WHERE id IN (
  'b12911fb-424e-43f9-9883-ceb8ccdeafb4', -- App de Agendamento (dupe of Aplicativo de Agendamento)
  'aff6f45a-7c38-4c6e-88c0-39199ec28048', -- App Delivery Local (dupe of Aplicativo de Delivery)
  '5a565747-0782-4dad-8f6e-07974ce554be', -- Aplicativo para Salão de Beleza (dupe of Cabeleireiro)
  'd4795c3b-9f48-4229-971c-dd578122a766'  -- Aplicativo de Compras (shares image with Fidelidade)
);

-- IA: Remove duplicates
UPDATE public.project_demos SET is_active = false WHERE id IN (
  '12e42507-bb2a-4a92-80cc-0e030132a545', -- IA Assistente de Vendas (dupe)
  'fd6728db-be1b-4bd8-ba4f-44a672be32ee', -- IA para Análise de Dados (dupe)
  'd977f61f-2111-4bdf-b724-33d17073286c', -- IA para Chat Online (dupe)
  'b20cf0ee-3c40-42c8-92b9-03dd3f5e0d6d', -- IA para CRM (dupe vendas)
  '4677b1b7-ba9c-486f-a26b-98311debe2aa', -- IA para Gestão de Clientes (dupe)
  '354fb75f-8e1b-49a9-b331-57780e5b7f36', -- IA para Recomendação de Produtos (dupe ecommerce)
  '8009397d-ac85-4f32-8c1a-2e51aa67d6cc'  -- IA para Orçamentos (dupe vendas)
);

-- LANDING: Remove duplicates
UPDATE public.project_demos SET is_active = false WHERE id IN (
  '51e29656-740e-4764-9478-13af4ba74819', -- Lançamento Curso Online (dupe)
  'a5b38e60-50ee-4779-9178-91cacd189519', -- LP para Aplicativo (dupe SaaS)
  '05d61a2c-1602-45ce-8066-dc3cbea88801', -- LP para Software (dupe SaaS)
  '847cc2a2-a20b-40b8-a7d7-0ca14a9af202', -- LP para Hamburgueria (dupe gastronomia)
  '2d0eafe9-fbdb-4604-b9a7-71ed4b72beb6', -- LP para Pizzaria (dupe gastronomia)
  'f5db1207-85a6-4a8a-a120-3094616d3946', -- LP para Clínica de Estética (dupe)
  '68bdf120-8d08-4c0f-9a91-0f713910fd0c', -- LP para Salão de Beleza (dupe beleza)
  '8f423d07-208b-4be7-bbe2-5236f7b432aa', -- LP para Energia Solar (dupe serviços)
  '8cb7c9d2-9aeb-4079-ad99-4f153a66519e'  -- LP para Consultoria (dupe serviços)
);

-- LOJA: Remove duplicates
UPDATE public.project_demos SET is_active = false WHERE id IN (
  '86f6ca0b-80e3-4296-a1cb-3ec9074b7991', -- Celulares (dupe eletrônicos)
  '331ae234-9d7d-45d7-8553-1a3ec194f8c6', -- Ferramentas (dupe eletrônicos)
  '934a4d93-7974-4dd8-8d23-a8bc07a4e812', -- Autopeças (dupe eletrônicos)
  '51d8d859-e72b-42be-b694-a26a1639b781', -- Loja Virtual Infantil (dupe brinquedos)
  '6a9e2a62-537e-4729-90cf-65260ce315ef', -- Relógios (dupe joias)
  '07faee8f-fd6a-4267-8e68-0b9d1e058dc7', -- Moda Feminina (dupe roupas)
  '8903635d-ccf5-42f0-aa78-35ba0022ccc8', -- Moda Masculina (dupe roupas)
  '22184599-ae95-462c-a704-24c14f0f1a4c', -- Moda Feminina Store (dupe roupas)
  'e3c8dc4d-56fb-454d-af1a-8d2858b9cdea'  -- Suplementos Fitness (dupe naturais)
);

-- SISTEMA: Remove duplicates
UPDATE public.project_demos SET is_active = false WHERE id IN (
  '30c635c3-641a-4702-9017-e16ee65ef185', -- Sistema CRM (dupe)
  '6ac7b0e3-8e2c-4103-b404-7bf9ac87b19b', -- Controle de Clientes (dupe CRM)
  'cbbf4cf6-eb86-400d-aa33-9f2c21e6c274', -- Gestão de Contratos (dupe CRM)
  '84059b18-c282-4949-8f89-ae995b9a4734', -- Sistema ERP (dupe CRM)
  '90ad5795-480d-41a6-b413-ab1faed8a257', -- Sistema de Caixa (dupe financeiro)
  '2c8bb89a-a851-4b18-af43-f54d5f943bed', -- Gestão de Barbearia (dupe)
  '289f7333-682f-4d84-a56c-ce41d6b3995c', -- Restaurante duplicado
  '4d709911-5dab-46c5-86b3-1198ac3b51e1', -- Ordens de Serviço (dupe gestão)
  '65f467a0-d540-4837-9a17-a6efc7288741', -- Escritório (dupe gestão)
  'b8a594c6-a931-4d91-9247-d8c739993411'  -- Sapataria (dupe gestão)
);

-- SITE: Remove duplicates
UPDATE public.project_demos SET is_active = false WHERE id IN (
  '00431a7f-df5b-4994-8dc1-9dc822e54b5e', -- Barbearia (dupe beleza)
  '0564671c-d38e-41ea-972a-9ef20ce839fd', -- Cabeleireiro (dupe beleza)
  'b8737142-272c-42a0-b531-943742cee9f8', -- Clínica Estética (dupe beleza)
  '4b1eb9ea-71d2-4c07-8fec-8a830bc4975d', -- Estética (dupe beleza)
  'e7be102c-93a3-4986-9c9d-9b84a532ea82', -- Contabilidade (dupe escritório)
  '93b1caa7-8cd3-4e6d-8b99-c56f64b46c03', -- Autopeças (dupe oficina)
  'be81bf1f-84fb-4946-b1f7-40de88747901', -- Hamburgueria (dupe restaurante)
  '87664d8a-6557-4e4c-957d-b2243706d94c', -- Pizzaria (dupe restaurante)
  'd3b8700e-2e39-4f41-9416-60076efd606b', -- Loja Agropecuária (dupe supermercado)
  '9066d8b3-4ff5-4b3b-a14f-bb75142b9c15'  -- Sapataria (dupe calçados)
);

-- Insert new demos with unique niches (using existing orphaned images)
INSERT INTO public.project_demos (name, category, segment, description, is_active, is_featured) VALUES
  ('Aplicativo para Pet Shop', 'aplicativo', 'Pet', 'App para pet shop com agendamento de banho e tosa, vacinas e produtos', true, false),
  ('IA para Automação de Processos', 'ia', 'Automação', 'Sistema de IA que automatiza workflows e processos repetitivos do negócio', true, false),
  ('IA para CRM Inteligente', 'ia', 'CRM', 'CRM com inteligência artificial para gestão de relacionamento com clientes', true, false),
  ('IA para Orçamentos Automáticos', 'ia', 'Orçamentos', 'IA que gera orçamentos personalizados automaticamente com base no histórico', true, false),
  ('IA para Recomendação Personalizada', 'ia', 'Recomendação', 'Sistema de IA que recomenda produtos com base no perfil do cliente', true, false),
  ('Landing Page para Estética', 'landing', 'Beleza', 'Landing page profissional para clínica de estética e beleza', true, false),
  ('Landing Page para Condomínio', 'landing', 'Imobiliário', 'Landing page para venda de apartamentos e unidades em condomínios', true, false),
  ('Loja Virtual de Alimentos Gourmet', 'loja', 'Alimentos', 'Loja online de alimentos gourmet, orgânicos e especiarias', true, false);
