================================================================================
  BOMBERMAN ARCADE - INSTRUÇÕES PARA BATOCERA LINUX (FLIPERAMA)
================================================================================

Este jogo é um HTML5 puro (JavaScript + Canvas). Para rodar no Batocera Linux
como jogo de fliperama com 1 joystick + 6 botões, siga os passos abaixo.

--------------------------------------------------------------------------------
1. COPIAR OS ARQUIVOS PARA O BATOCERA
--------------------------------------------------------------------------------

Copie toda a pasta "files" para o Batocera. Exemplo:
  /userdata/roms/bomberman/

Dentro dela devem estar:
  index.html
  script.js
  shared.js
  levels.js
  maps.js
  editor.js
  editor.html
  style.css

Os mapas editados ficam no arquivo maps.js, não no armazenamento do navegador.
Ao salvar um mapa no editor, coloque o maps.js baixado nesta pasta do jogo
(ou na pasta sincronizada pelo OneDrive) para usá-lo em outros computadores.

--------------------------------------------------------------------------------
2. CRIAR SCRIPT DE LANÇAMENTO (OPCIONAL, MAS RECOMENDADO)
--------------------------------------------------------------------------------

Crie um arquivo chamado "bomberman.sh" dentro da mesma pasta:

  #!/bin/bash
  cd "$(dirname "$0")"
  exec chromium-browser --kiosk --disable-gpu --disable-software-rasterizer \
    --app="file:///userdata/roms/bomberman/index.html"

Torne executável:
  chmod +x bomberman.sh

--------------------------------------------------------------------------------
3. ADICIONAR NO EMULATIONSTATION (Batocera)
--------------------------------------------------------------------------------

No Batocera, vá em:
  CONFIGURAÇÕES DO SISTEMA > GERENCIADOR DE ARQUIVOS

Navegue até /userdata/roms/ e crie uma pasta chamada "bomberman" (se não existir).

Cole os arquivos do jogo lá. Em seguida:
  CONFIGURAÇÕES DO SISTEMA > JOGOS > SCANNEAR ARQUIVOS

Ou edite manualmente o es_systems.cfg para adicionar um sistema personalizado.

--------------------------------------------------------------------------------
4. MAPEAMENTO DE CONTROLES (1 JOYSTICK + 6 BOTÕES)
--------------------------------------------------------------------------------

O jogo detecta automaticamente o primeiro gamepad conectado via Gamepad API.

Controle padrão (fliperama 1 jogador):

  Joystick analógico esquerdo / D-pad  -> Mover o jogador
  Botão 1 (geralmente A / Cruz / Vermelho) -> Colocar bomba
  Botão 2 (B / Circle / Azul)         -> Confirmar no menu
  Botão 3 (X / Square / Verde)        -> Voltar / sair do menu
  Botões 4, 5, 6                      -> Reservados (sem ação no momento)
  Start / Select                      -> Navegar no menu

Se nenhum gamepad estiver conectado, o jogo funciona com teclado:
  Setas / WASD  -> Mover
  Espaço        -> Colocar bomba
  Enter         -> Confirmar menu
  Escape        -> Voltar

--------------------------------------------------------------------------------
5. TELA CHEIA AUTOMÁTICA
--------------------------------------------------------------------------------

O jogo entra em tela cheia (fullscreen/kiosk) automaticamente ao iniciar a
partida. Não há barras de rolagem nem interface do navegador visível.

--------------------------------------------------------------------------------
6. MAPA "REINO CONGELADO - FASE 1"
--------------------------------------------------------------------------------

Já está incluído no levels.js (nível 5 do array LEVELS):
  - Tamanho: 25 x 17 blocos
  - Tema: Reino Congelado (gelo, neve, gelo escuro, gelo rachado)
  - Paredes: gelo
  - Blocos destrutíveis: blocos de gelo e cristais
  - Decorações: cristais de gelo
  - Inimigos: Escorregadio, Congelador, Guardião Glacial

--------------------------------------------------------------------------------
7. SOLUÇÃO DE PROBLEMAS
--------------------------------------------------------------------------------

• Gamepad não detectado:
  - Conecte o joystick ANTES de abrir o jogo.
  - No Chromium, acesse chrome://gamepads para verificar se o controle é visto.

• Tela não fica cheia:
  - Alguns navegadores bloqueiam fullscreen sem interação do usuário.
  - Use o script .sh com --kiosk para forçar tela cheia.

• Jogo lento no Raspberry Pi:
  - O Chromium pode ser pesado. Considere usar o kiosk mode ou um servidor
    web leve (nginx/apache) para servir os arquivos.

• Botões do fliperama não funcionam:
  - Verifique mapeamento no EmulationStation (Entradas > Configurar controles).
  - O jogo lê o gamepad via API padrão do navegador.

================================================================================
  FIM DAS INSTRUÇÕES
================================================================================