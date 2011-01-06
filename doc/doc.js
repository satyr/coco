(function(){
  var title, doc, nav, htms, sdcv, __importAll = function(obj, src){ for (var key in src) obj[key] = src[key]; return obj };
  title = document.title;
  doc = document.getElementById('doc') || lmn('div', {
    id: 'doc'
  });
  nav = document.getElementById('nav') || (function(){
    var h, co, _i, _ref, _len;
    h = '<div class=pointee>&#x2935;</div>';
    if (title) {
      h += "<h1>" + title + "</h1>";
    }
    for (_i = 0, _len = (_ref = sources).length; _i < _len; ++_i) {
      co = _ref[_i];
      h += "<li><a href=#" + co + ">" + co + "</a>";
    }
    h += '<li class=index><a href=#>#</a>';
    return lmn('ul', {
      id: 'nav',
      innerHTML: h
    });
  }());
  htms = {
    __proto__: null
  };
  sdcv = new Showdown.converter;
  (this.onhashchange = function(){
    var page, name, that, xhr;
    if (!(page = /^\D+(?=(\d*)$)/.exec(location.hash.slice(1)))) {
      document.title = title;
      nav.className = doc.innerHTML = '';
      return;
    }
    nav.className = 'menu';
    doc.innerHTML = '...';
    name = page[0];
    if (that = htms[name]) {
      return load(page, that);
    }
    xhr = new XMLHttpRequest;
    xhr.open('GET', name !== 'Cokefile' ? name + '.co' : name, true);
    if (typeof xhr.overrideMimeType == 'function') {
      xhr.overrideMimeType('text/plain');
    }
    xhr.onreadystatechange = function(){
      if (xhr.readyState === 4) {
        return load(page, htms[name] = build(name, xhr.responseText));
      }
    };
    return xhr.send(null);
  })();
  function lmn(name, attrs){
    return document.body.appendChild(__importAll(document.createElement(name), attrs));
  }
  function load(_arg, _arg2){
    var name, sect;
    name = _arg[0], sect = _arg[1];
    doc.innerHTML = _arg2;
    document.title = name + (title && ' - ' + title);
    if (sect) {
      document.getElementById(sect).scrollIntoView();
    }
    return prettyPrint();
  }
  function build(name, source){
    var lines, i, comment, htm, code, re, line, br, that, _i, _len;
    lines = source.split('\n');
    htm = comment = i = '';
    code = /^#!/.test(lines[0]) ? lines.shift() : '';
    re = /^[^\n\S]*#(?!##(?!#)|{) ?(.*)/;
    for (_i = 0, _len = lines.length; _i < _len; ++_i) {
      line = lines[_i];
      if (!line) {
        br = true;
        code && (code += '\n');
        continue;
      }
      if (that = re.exec(line)) {
        if (code || comment && br) {
          htm += block(name, comment, code, i++);
          comment = code = '';
        }
        comment += that[1] + '\n';
      } else {
        code += line + '\n';
      }
      br = false;
    }
    if (comment || code) {
      htm += block(name, comment, code, i);
    }
    return "<h1>" + name + "</h1>" + htm + "<br clear=both>";
  }
  function block(name, comment, code, i){
    code && (code = "<pre class=\"code prettyprint lang-co\"\n >" + code.replace(/&/g, '&amp;').replace(/</g, '&lt;') + "</pre>");
    return "<div id=" + i + " class=block><div class=comment\n ><a class=anchor href=#" + name + i + ">#" + i + "</a\n >" + sdcv.makeHtml(comment) + "</div\n >" + code + "</div>";
  }
}).call(this);
