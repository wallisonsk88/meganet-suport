# Plano de Implementação: PWA, Som no Chat e Câmera

Este plano descreve as etapas para transformar o MegaNetSuport em um Aplicativo Web Progressivo (PWA), adicionar alertas sonoros ao monitorar novas mensagens e garantir que o envio de fotos funcione perfeitamente em dispositivos móveis.

## Alterações Propostas

### 1. Progressive Web App (PWA)
Objetivo: Permitir que o usuário "baixe" o site como um aplicativo no celular.

#### [NEW] [manifest.json](file:///c:/Users/Wallison/Desktop/Suporte/meganet-suport/public/manifest.json)
- Define nome, ícones e comportamento de "app" (standalone).

#### [NEW] [sw.js](file:///c:/Users/Wallison/Desktop/Suporte/meganet-suport/public/sw.js)
- Service Worker simples para cumprir requisitos de instalação e cache offline básico de assets estáticos.

#### [MODIFY] [index.html](file:///c:/Users/Wallison/Desktop/Suporte/meganet-suport/index.html)
- Adicionar link para o `manifest.json`.
- Adicionar script para registrar o `sw.js`.
- Adicionar meta tags de `theme-color` e `apple-touch-icon`.

### 2. Chat: Alerta Sonoro e Foto
Objetivo: Melhorar a comunicação em tempo real.

#### [MODIFY] [ChatWidget.jsx](file:///c:/Users/Wallison/Desktop/Suporte/meganet-suport/src/components/ChatWidget.jsx)
- **Som**: Importar um arquivo de áudio curto e tocar quando uma nova mensagem chegar de outro usuário.
- **Câmera**: Garantir que o input de arquivo abra a câmera/galeria no mobile (`accept="image/*"`).

## Plano de Verificação

### Testes Manuais
1.  **PWA**: Abrir no Google Chrome (Desktop ou Android) e verificar se aparece o prompt de instalação ("Adicionar à tela de início").
2.  **Som**: Enviar mensagem de um usuário diferente e verificar se o bip sonoro toca.
3.  **Câmera**: Clicar no ícone de imagem no celular e verificar se oferece a opção de "Câmera" ou "Arquivos".
