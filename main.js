(function() {

  function removeSpaces(input) {
    return input.replace(/[\s\n\t]/g, '');
  }

  function indent(input) {
    let temp = input.replace(/^\n+/g, '');
    let len = temp.length - temp.replace(/^\s+/g, '').length;
    let result = input.split('\n').map(n => (
      n.replace(new RegExp(`^\\s{${len}}`, 'g'), '')
    ));
    return result.join('\n');
  }

  const nameLinks = document.querySelectorAll('a[name]');
  [].forEach.call(nameLinks, link => {
    let a = document.createElement('a');
    a.innerHTML = '#';
    a.href = '#' + link.name;
    link.parentNode.insertBefore(a, link);
  });

  const examples = document.querySelectorAll('.example');
  [].forEach.call(examples, example => {
    let textarea = example.querySelector('textarea');
    if (textarea) {
      textarea.value = example.querySelector('.container').innerHTML;
    }
  });

  const codeBlocks = document.querySelectorAll('textarea[code]');
  [].forEach.call(codeBlocks, block => {
    let content = indent(block.value).trim();
    let sample = document.createElement('div');
    sample.className = 'code-sample';
    block.parentNode.replaceChild(sample, block);
    CodeMirror(sample, {
      mode: block.getAttribute('code') || 'css',
      value: content,
      readOnly: ('ontouchstart' in window) ? 'nocursor' : true,
      cursorBlinkRate: -1,
      theme: '3024-day',
      tabSize: 2
    });
  });

  const doodles = {
    leaves: indent(`
      :doodle {
        @grid: 8 / 90%;
        @shape: circle;
      }

      transition: .2s @rand(.6s);
      border-radius: @pick(100% 0, 0 100%);

      will-change: transform;
      transform: scale(@rand(.25, 1.25));

      background: hsla(
        calc(240 - 6 * @row() * @col()),
        70%, 68%,
        @rand(.8)
      );
    `),
    lines: indent(`
      :doodle {
        @grid: 7 / 100%;
      }

      @place-cell: center;
      @size: calc(@index() * 1.55%);

      transition: .2s ease;
      transform: rotate(calc(@index() * 5deg));

      border-radius: 30%;
      border: 1px solid hsla(
        calc(10 + 4 * @index()), 70%, 68%,
        @rand(.8)
      );
    `),
    triangles: indent(`
      :doodle {
        @grid: 9 / 85%;
        @shape: circle;
      }

      will-change: transform;
      transition: .4s @rand(.6s);
      transform: rotate(@rand(360deg));
      @shape: triangle;

      --n: calc(
          @abs(@abs(@row() - 5)
        + @abs(@col() - 5) - 9) / 9
      );

      background: hsla(
        calc(var(--n) * 360 + 120),
        60%, 68%, var(--n)
      );
    `),
    circles: indent(`
      :doodle {
        @grid: 10 / 85%
      }

      transition: @rand(500ms) ease;
      margin: -.2px;

      background: hsl(
        calc(200 + 2 * @row() * @col()),
        70%, 70%
      );

      clip-path: polygon(@pick(
        '0 0, 100% 0, 100% 100%',
        '0 0, 100% 0, 0 100%',
        '0 0, 100% 100%, 0 100%',
        '100% 0, 100% 100%, 0 100%'
      ));
    `),
    dashed: indent(`
      :doodle {
        @grid: 1x10 / 85%;
      }

      @place-cell: center;
      @size: calc(@index() * 10%);

      border-radius: 50%;
      border-style: dashed;
      border-width: calc(@index() * 4px);
      border-color: hsla(
        calc(20 * @index()), 70%, 68%,
        calc(3 / @index() * .8)
      );

      transform: rotate(@rand(360deg));
    `),
    flow: indent(`
      :doodle {
        @grid: 100x1 / 100%;
      }

      :container {
        @size: 120%;
        transform:
          scale(8) translate(10%, 7%)
          rotate(45deg)
      }

      @place-cell: center;
      @size: calc(100% - @row() * 1%) 20%;

      transition: .2s @rand(300ms);
      border-radius: 50%;
      background: @pick(
        #f9ed69, #f08a5d, #b83b5e, #6a2c70
      );
    `)
  }

  function getDoodleFromUrl() {
    try {
      return decodeURIComponent(
        (window.location.search.substr(1)
          .split('&')
          .filter(n => n.startsWith('d='))[0] || ''
        ).split('=')[1] || ''
      );
    } catch (e) {
      return '';
    }
  }

  function getDoodle() {
    let candidates = Object.keys(doodles);
    let name = candidates[~~(Math.random() * candidates.length)];
    return getDoodleFromUrl() || doodles[name];
  }

  const config = {
    value: getDoodle(),
    mode: 'css',
    insertSoftTab: true,
    theme: '3024-day',
    matchBrackets: true,
    smartIndent: true,
    tabSize: 2
  }

  let doodle = document.createElement('css-doodle');
  doodle.title = 'Click to update';
  if (doodle.update) {
    doodle.update(config.value);
  }

  let playground = document.querySelector('.playground');
  let source = document.querySelector('.playground .source');

  let container = document.querySelector('.playground .doodle')
  container.appendChild(doodle);
  container.addEventListener('click', function(e) {
    e.preventDefault();
    if (e.target.matches('css-doodle')) {
      doodle.update();
    }
  });

  let editor = CodeMirror(source, config);
  let old = removeSpaces(editor.getValue());
  let timer = null;
  editor.on('change', function(_, obj) {
    clearTimeout(timer);
    timer = setTimeout(function() {
      if (old != removeSpaces(editor.getValue())) {
        if (doodle.update) {
          doodle.innerHTML = editor.getValue();
          doodle.update(editor.getValue());
        }
        old = removeSpaces(editor.getValue());
      }
    }, 500);
  });

  document.querySelector('.docs').addEventListener('click', function(e) {
    if (e.target.matches('css-doodle.click-to-update')) {
      e.target.update();
    }
  });

  const allShapes = document.querySelector('.basic-shapes .shapes');
  const shapes = [
    'circle',        'triangle',      'rhombus',       'pentagon',
    'hexagon',       'heptagon',      'octagon',       'cross',
    'star',          'diamond',       'infinity',      'heart',
    'fish',          'whale',         'pear',          'bean',
    'hypocycloid:3', 'hypocycloid:4', 'hypocycloid:5', 'hypocycloid:6',
    'bicorn',        'clover:3',      'clover:4',      'clover:5',
    'bud:3',         'bud:4',         'bud:5',         'bud:10'
  ];

  if (allShapes) {
    allShapes.innerHTML = shapes.map(shape => {
      let [name, param] = shape.split(':').map(n => n.trim());
      return `
        <div class="shape">
          <css-doodle>
            :doodle {
              @shape: ${ name } ${ param || 1};
              background: #60569e;
            }
          </css-doodle>
          <p class="title">
            ${ param ? `(${ name }, ${ param })` : name }
          </p>
        </div>
      `
    }).join('');
  }

}());
