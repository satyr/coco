var title, doc, nav, htms, sdcv;
title = document.title;
doc = document.getElementById('doc') || lmn('div', {
  id: 'doc'
});
nav = document.getElementById('nav') || (function(){
  var h, i$, ref$, len$, co;
  h = '<div class=pointee>&#x2935;</div>';
  if (title) {
    h += "<h1>" + title + "</h1>";
  }
  for (i$ = 0, len$ = (ref$ = sources).length; i$ < len$; ++i$) {
    co = ref$[i$];
    h += co ? "<li><a href=#" + co + ">" + co + "</a>" : '<p class=spacer>';
  }
  h += '<li class=index><a href=#>#</a>';
  return lmn('ul', {
    id: 'nav',
    innerHTML: h
  });
}.call(this));
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
      load(page, htms[name] = build(name, xhr.responseText));
    }
  };
  xhr.send(null);
})();
function lmn(name, attrs){
  return document.body.appendChild(importAll$(document.createElement(name), attrs));
}
function load(arg$, innerHTML){
  var name, sect;
  name = arg$[0], sect = arg$[1];
  doc.innerHTML = innerHTML;
  document.title = name + (title && ' - ' + title);
  if (sect) {
    document.getElementById(sect).scrollIntoView();
  }
  prettyPrint();
}
function build(name, source){
  var htm, comment, code, i, re, i$, ref$, len$, line, br, that;
  htm = comment = code = i = '';
  re = /^[^\n\S]*#(?![!{$A-Za-z_]) ?(.*)/;
  for (i$ = 0, len$ = (ref$ = source.split('\n')).length; i$ < len$; ++i$) {
    line = ref$[i$];
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
function importAll$(obj, src){
  for (var key in src) obj[key] = src[key];
  return obj;
}