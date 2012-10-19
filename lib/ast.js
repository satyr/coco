var Node, Negatable, Block, Atom, Literal, Var, Key, Index, Chain, Call, List, Obj, Prop, Arr, Unary, Binary, Assign, Import, Of, Existence, Fun, Class, Super, Parens, Splat, Jump, Throw, Return, While, For, Try, Switch, Case, If, Label, Pipe, Cascade, JS, Util, Vars, DECLS, ref$, UTILS, LEVEL_TOP, LEVEL_PAREN, LEVEL_LIST, LEVEL_COND, LEVEL_OP, LEVEL_CALL, PREC, TAB, ID, SIMPLENUM, slice$ = [].slice, replace$ = ''.replace;
(Node = function(){
  throw Error('unimplemented');
}).prototype = {
  compile: function(options, level){
    var o, key, node, code, that, i$, len$, tmp;
    o = {};
    for (key in options) {
      o[key] = options[key];
    }
    if (level != null) {
      o.level = level;
    }
    node = this.unfoldSoak(o) || this;
    if (o.level && node.isStatement()) {
      return node.compileClosure(o);
    }
    code = (node.tab = o.indent, node).compileNode(o);
    if (that = node.temps) {
      for (i$ = 0, len$ = that.length; i$ < len$; ++i$) {
        tmp = that[i$];
        o.scope.free(tmp);
      }
    }
    return code;
  },
  compileClosure: function(o){
    var that, fun, call, hasArgs, hasThis;
    if (that = this.getJump()) {
      that.carp('inconvertible statement');
    }
    fun = Fun([], Block(this));
    call = Call();
    this.traverseChildren(function(it){
      switch (it.value) {
      case 'this':
        hasThis = true;
        break;
      case 'arguments':
        hasArgs = it.value = 'args$';
      }
    });
    if (hasThis) {
      call.args.push(Literal('this'));
      call.method = '.call';
    }
    if (hasArgs) {
      call.args.push(Literal('arguments'));
      fun.params.push(Var('args$'));
    }
    return Parens(Chain((fun.wrapper = true, fun['void'] = this['void'], fun), [call]), true).compile(o);
  },
  compileBlock: function(o, node){
    var that;
    if (that = node != null ? node.compile(o, LEVEL_TOP) : void 8) {
      return "{\n" + that + "\n" + this.tab + "}";
    } else {
      return '{}';
    }
  },
  cache: function(o, once, level){
    var ref$, sub, ref;
    if (!this.isComplex()) {
      return [ref$ = level != null ? this.compile(o, level) : this, ref$];
    }
    sub = Assign(ref = Var(o.scope.temporary()), this);
    if (level != null) {
      sub = sub.compile(o, level);
      if (once) {
        o.scope.free(ref.value);
      }
      return [sub, ref.value];
    }
    if (once) {
      return [sub, (ref.temp = true, ref)];
    } else {
      return [sub, ref, [ref.value]];
    }
  },
  compileLoopReference: function(o, name, ret){
    var ref$, asn, tmp;
    if (this instanceof Var && o.scope.check(this.value) || this instanceof Unary && ((ref$ = this.op) === '+' || ref$ === '-') && (-1 / 0 < (ref$ = +this.it.value) && ref$ < 1 / 0) || this instanceof Literal && !this.isComplex()) {
      return [ref$ = this.compile(o), ref$];
    }
    asn = Assign(Var(tmp = o.scope.temporary(name)), this);
    ret || (asn['void'] = true);
    return [tmp, asn.compile(o, ret ? LEVEL_CALL : LEVEL_PAREN)];
  },
  eachChild: function(fn){
    var i$, ref$, len$, name, child, i, len1$, node, that;
    for (i$ = 0, len$ = (ref$ = this.children).length; i$ < len$; ++i$) {
      name = ref$[i$];
      if (child = this[name]) {
        if ('length' in child) {
          for (i = 0, len1$ = child.length; i < len1$; ++i) {
            node = child[i];
            if ((that = fn(node, name, i)) != null) {
              return that;
            }
          }
        } else {
          if ((that = fn(child, name)) != null) {
            return that;
          }
        }
      }
    }
  },
  traverseChildren: function(fn, xscope){
    var this$ = this;
    return this.eachChild(function(node, name, index){
      var ref$;
      return (ref$ = fn(node, this$, name, index)) != null
        ? ref$
        : node.traverseChildren(fn, xscope);
    });
  },
  anaphorize: function(){
    var base, name, ref$;
    this.children = this.aTargets;
    if (this.eachChild(hasThat)) {
      if ((base = this)[name = this.aSource] instanceof Existence) {
        base = base[name];
        name = 'it';
      }
      if (base[name].value !== 'that') {
        base[name] = Assign(Var('that'), base[name]);
      }
    }
    function hasThat(it){
      var that;
      return it.value === 'that' || ((that = it.aSource)
        ? (that = it[that]) ? hasThat(that) : void 8
        : it.eachChild(hasThat));
    }
    delete this.children;
    return ref$ = this[this.aSource], ref$.cond = true, ref$;
  },
  carp: function(it){
    throw SyntaxError(it + " on line " + (this.line || this.traverseChildren(function(it){
      return it.line;
    })));
  },
  delegate: function(names, fn){
    var i$, len$, name;
    for (i$ = 0, len$ = names.length; i$ < len$; ++i$) {
      name = names[i$];
      (fn$.call(this, name));
    }
    function fn$(name){
      this[name] = function(it){
        return fn.call(this, name, it);
      };
    }
  },
  children: [],
  terminator: ';',
  isComplex: YES,
  isStatement: NO,
  isAssignable: NO,
  isCallable: NO,
  isEmpty: NO,
  isArray: NO,
  isString: NO,
  isRegex: NO,
  isMatcher: function(){
    return this.isString() || this.isRegex();
  },
  assigns: NO,
  ripName: VOID,
  unfoldSoak: VOID,
  unfoldAssign: VOID,
  unparen: THIS,
  unwrap: THIS,
  maybeKey: THIS,
  expandSlice: THIS,
  varName: String,
  getAccessors: VOID,
  getCall: VOID,
  getDefault: VOID,
  getJump: VOID,
  invert: function(){
    return Unary('!', this, true);
  },
  addElse: function($else){
    this['else'] = $else;
    return this;
  },
  makeReturn: function(arref){
    if (arref) {
      return Call.make(JS(arref + '.push'), [this]);
    } else {
      return Return(this);
    }
  },
  show: String,
  toString: function(idt){
    var tree, that;
    idt || (idt = '');
    tree = '\n' + idt + this.constructor.displayName;
    if (that = this.show()) {
      tree += ' ' + that;
    }
    this.eachChild(function(it){
      tree += it.toString(idt + TAB);
    });
    return tree;
  },
  stringify: function(space){
    return JSON.stringify(this, null, space);
  },
  toJSON: function(){
    return import$({
      type: this.constructor.displayName
    }, this);
  }
};
exports.parse = function(json){
  return exports.fromJSON(JSON.parse(json));
};
exports.fromJSON = (function(){
  function fromJSON(it){
    var that, node, key, val, i$, len$, v, results$ = [];
    if (!(it && typeof it === 'object')) {
      return it;
    }
    if (that = it.type) {
      node = clone$(exports[that].prototype);
      for (key in it) {
        val = it[key];
        node[key] = fromJSON(val);
      }
      return node;
    }
    if (it.length != null) {
      for (i$ = 0, len$ = it.length; i$ < len$; ++i$) {
        v = it[i$];
        results$.push(fromJSON(v));
      }
      return results$;
    } else {
      return it;
    }
  }
  return fromJSON;
}());
Negatable = {
  show: function(){
    return this.negated && '!';
  },
  invert: function(){
    this.negated = !this.negated;
    return this;
  }
};
exports.Block = Block = (function(superclass){
  Block.displayName = 'Block';
  var prototype = extend$(Block, superclass).prototype, constructor = Block;
  function Block(body){
    var this$ = this instanceof ctor$ ? this : new ctor$;
    body || (body = []);
    if ('length' in body) {
      this$.lines = body;
    } else {
      this$.lines = [];
      this$.add(body);
    }
    return this$;
  } function ctor$(){} ctor$.prototype = prototype;
  prototype.children = ['lines'];
  prototype.toJSON = function(){
    delete this.back;
    return superclass.prototype.toJSON.call(this);
  };
  prototype.add = function(it){
    var that, ref$;
    it = it.unparen();
    switch (false) {
    case !(that = this.back):
      that.add(it);
      break;
    case !(that = it.lines):
      (ref$ = this.lines).push.apply(ref$, that);
      break;
    default:
      this.lines.push(it);
      if (that = it.back, delete it.back, that) {
        this.back = that;
      }
    }
    return this;
  };
  prototype.prepend = function(){
    var ref$;
    (ref$ = this.lines).splice.apply(ref$, [this.neck(), 0].concat(slice$.call(arguments)));
    return this;
  };
  prototype.unwrap = function(){
    if (this.lines.length === 1) {
      return this.lines[0];
    } else {
      return this;
    }
  };
  prototype.chomp = function(){
    var lines, i, that;
    lines = this.lines;
    i = lines.length;
    while (that = lines[--i]) {
      if (!that.comment) {
        break;
      }
    }
    lines.length = i + 1;
    return this;
  };
  prototype.neck = function(){
    var pos, ref$, len$, x;
    for (pos = 0, len$ = (ref$ = this.lines).length; pos < len$; ++pos) {
      x = ref$[pos];
      if (!(x.comment || x instanceof Literal)) {
        break;
      }
    }
    return pos;
  };
  prototype.isComplex = function(){
    var ref$;
    return this.lines.length > 1 || ((ref$ = this.lines[0]) != null ? ref$.isComplex() : void 8);
  };
  prototype.delegate(['isCallable', 'isArray', 'isString', 'isRegex'], function(it){
    var ref$, ref1$;
    return (ref$ = (ref1$ = this.lines)[ref1$.length - 1]) != null ? ref$[it]() : void 8;
  });
  prototype.getJump = function(it){
    var i$, ref$, len$, node, that;
    for (i$ = 0, len$ = (ref$ = this.lines).length; i$ < len$; ++i$) {
      node = ref$[i$];
      if (that = node.getJump(it)) {
        return that;
      }
    }
  };
  prototype.makeReturn = function(it){
    var that, ref$, key$, ref1$;
    if (that = (ref1$ = ref$ = this.lines)[key$ = ref1$.length - 1] != null ? ref$[key$] = ref$[key$].makeReturn(it) : void 8) {
      if (that instanceof Return && !that.it) {
        --this.lines.length;
      }
    }
    return this;
  };
  prototype.compile = function(o, level){
    var tab, codes, res$, i$, ref$, len$, node, code;
    level == null && (level = o.level);
    if (level) {
      return this.compileExpressions(o, level);
    }
    o.block = this;
    tab = o.indent;
    res$ = [];
    for (i$ = 0, len$ = (ref$ = this.lines).length; i$ < len$; ++i$) {
      node = ref$[i$];
      node = node.unfoldSoak(o) || node;
      if (!(code = (node.front = true, node).compile(o, level))) {
        continue;
      }
      node.isStatement() || (code += node.terminator);
      res$.push(tab + code);
    }
    codes = res$;
    return codes.join('\n');
  };
  prototype.compileRoot = function(options){
    var o, bare, ref$, prefix, code;
    o = (import$({
      level: LEVEL_TOP,
      scope: this.scope = Scope.root = new Scope
    }, options));
    delete o.filename;
    o.indent = (bare = o.bare, delete o.bare, bare) ? '' : TAB;
    if (/^\s*(?:[/#]|javascript:)/.test((ref$ = this.lines[0]) != null ? ref$.code : void 8)) {
      prefix = this.lines.shift().code + '\n';
    }
    if ((ref$ = o.eval, delete o.eval, ref$) && this.chomp().lines.length) {
      if (bare) {
        this.lines.push(Parens(this.lines.pop()));
      } else {
        this.makeReturn();
      }
    }
    code = this.compileWithDeclarations(o);
    bare || (code = "(function(){\n" + code + "\n}).call(this);\n");
    return [prefix] + code;
  };
  prototype.compileWithDeclarations = function(o){
    var pre, i, rest, post, that;
    o.level = LEVEL_TOP;
    pre = '';
    if (i = this.neck()) {
      rest = this.lines.splice(i, 9e9);
      pre = this.compile(o);
      this.lines = rest;
    }
    if (!(post = this.compile(o))) {
      return pre;
    }
    return (pre && pre + "\n") + ((that = this.scope) ? that.emit(post, o.indent) : post);
  };
  prototype.compileExpressions = function(o, level){
    var lines, i, that, code, last, i$, len$, node;
    lines = this.lines;
    i = -1;
    while (that = lines[++i]) {
      if (that.comment) {
        lines.splice(i--, 1);
      }
    }
    if (!lines.length) {
      lines.push(Literal('void'));
    }
    lines[0].front = this.front;
    lines[lines.length - 1]['void'] = this['void'];
    if (!lines[1]) {
      return lines[0].compile(o, level);
    }
    code = '';
    last = lines.pop();
    for (i$ = 0, len$ = lines.length; i$ < len$; ++i$) {
      node = lines[i$];
      code += (node['void'] = true, node).compile(o, LEVEL_PAREN) + ', ';
    }
    code += last.compile(o, LEVEL_PAREN);
    if (level < LEVEL_LIST) {
      return code;
    } else {
      return "(" + code + ")";
    }
  };
  return Block;
}(Node));
Atom = (function(superclass){
  Atom.displayName = 'Atom';
  var prototype = extend$(Atom, superclass).prototype, constructor = Atom;
  prototype.show = function(){
    return this.value;
  };
  prototype.isComplex = NO;
  function Atom(){}
  return Atom;
}(Node));
exports.Literal = Literal = (function(superclass){
  Literal.displayName = 'Literal';
  var prototype = extend$(Literal, superclass).prototype, constructor = Literal;
  function Literal(value){
    var this$ = this instanceof ctor$ ? this : new ctor$;
    this$.value = value;
    if (value.js) {
      return JS(value + "", true);
    }
    if (value === 'super') {
      return new Super;
    }
    return this$;
  } function ctor$(){} ctor$.prototype = prototype;
  prototype.isEmpty = function(){
    var ref$;
    return (ref$ = this.value) === 'null' || ref$ === 'void';
  };
  prototype.isCallable = function(){
    var ref$;
    return (ref$ = this.value) === 'this' || ref$ === 'eval' || ref$ === '&';
  };
  prototype.isString = function(){
    return 0 <= '\'"'.indexOf((this.value + "").charAt());
  };
  prototype.isRegex = function(){
    return (this.value + "").charAt() === '/';
  };
  prototype.isComplex = function(){
    return this.isRegex() || this.value === 'debugger';
  };
  prototype.varName = function(){
    if (/^\w+$/.test(this.value)) {
      return '$' + this.value;
    } else {
      return '';
    }
  };
  prototype.compile = function(o, level){
    var val, ref$;
    level == null && (level = o.level);
    switch (val = this.value + "") {
    case 'this':
      return ((ref$ = o.scope.fun) != null ? ref$.bound : void 8) || val;
    case 'void':
      if (!level) {
        return '';
      }
      val += ' 8';
      // fallthrough
    case 'null':
      if (level === LEVEL_CALL) {
        this.carp('invalid use of ' + this.value);
      }
      break;
    case 'debugger':
      if (level) {
        return "(function(){\n" + TAB + o.indent + "debugger;\n" + o.indent + "}())";
      }
      break;
    case '*':
      this.carp('stray star');
      break;
    case '&':
      if (!(val = o.cascadee)) {
        this.carp('stray cascadee');
      }
      val.referred = true;
    }
    return val;
  };
  return Literal;
}(Atom));
exports.Var = Var = (function(superclass){
  Var.displayName = 'Var';
  var prototype = extend$(Var, superclass).prototype, constructor = Var;
  function Var(value){
    var this$ = this instanceof ctor$ ? this : new ctor$;
    this$.value = value;
    return this$;
  } function ctor$(){} ctor$.prototype = prototype;
  prototype.isAssignable = prototype.isCallable = YES;
  prototype.assigns = function(it){
    return it === this.value;
  };
  prototype.maybeKey = function(){
    var ref$;
    return ref$ = Key(this.value), ref$.line = this.line, ref$;
  };
  prototype.varName = prototype.show;
  prototype.compile = function(o){
    if (o.pipee != null && this.value === '_') {
      this.value = o.pipee;
    }
    if (this.temp) {
      return o.scope.free(this.value);
    } else {
      return this.value;
    }
  };
  return Var;
}(Atom));
exports.Key = Key = (function(superclass){
  Key.displayName = 'Key';
  var prototype = extend$(Key, superclass).prototype, constructor = Key;
  function Key(name, reserved){
    var this$ = this instanceof ctor$ ? this : new ctor$;
    this$.reserved = reserved || name.reserved;
    this$.name = '' + name;
    return this$;
  } function ctor$(){} ctor$.prototype = prototype;
  prototype.isComplex = NO;
  prototype.assigns = function(it){
    return it === this.name;
  };
  prototype.varName = function(){
    var name;
    name = this.name;
    if (this.reserved || (name === 'arguments' || name === 'eval')) {
      return "$" + name;
    } else {
      return name;
    }
  };
  prototype.compile = prototype.show = function(){
    if (this.reserved) {
      return "'" + this.name + "'";
    } else {
      return this.name;
    }
  };
  return Key;
}(Node));
exports.Index = Index = (function(superclass){
  Index.displayName = 'Index';
  var prototype = extend$(Index, superclass).prototype, constructor = Index;
  function Index(key, symbol, init){
    var k, this$ = this instanceof ctor$ ? this : new ctor$;
    symbol || (symbol = '.');
    if (init && key instanceof Arr) {
      switch (key.items.length) {
      case 0:
        key = Key('__proto__');
        break;
      case 1:
        if (!((k = key.items[0]) instanceof Splat)) {
          key = Parens(k);
        }
      }
    }
    switch (symbol.slice(-1)) {
    case '=':
      this$.assign = symbol.slice(1);
      break;
    case '@':
      this$.vivify = symbol.length > 2 ? Arr : Obj;
    }
    this$.key = key;
    this$.symbol = symbol;
    return this$;
  } function ctor$(){} ctor$.prototype = prototype;
  prototype.children = ['key'];
  prototype.show = function(){
    return [this.soak ? '?' : void 8] + this.symbol;
  };
  prototype.isComplex = function(){
    return this.key.isComplex();
  };
  prototype.varName = function(){
    var ref$;
    return ((ref$ = this.key) instanceof Key || ref$ instanceof Literal) && this.key.varName();
  };
  prototype.compile = function(o){
    var code;
    code = this.key.compile(o, LEVEL_PAREN);
    if (this.key instanceof Key && '\'' !== code.charAt(0)) {
      return "." + code;
    } else {
      return "[" + code + "]";
    }
  };
  return Index;
}(Node));
exports.Chain = Chain = (function(superclass){
  Chain.displayName = 'Chain';
  var prototype = extend$(Chain, superclass).prototype, constructor = Chain;
  function Chain(head, tails){
    var this$ = this instanceof ctor$ ? this : new ctor$;
    if (!tails && head instanceof Chain) {
      return head;
    }
    this$.head = head;
    this$.tails = tails || [];
    return this$;
  } function ctor$(){} ctor$.prototype = prototype;
  prototype.children = ['head', 'tails'];
  prototype.add = function(it){
    var ref$, that;
    if (this.head instanceof Existence) {
      ref$ = Chain(this.head.it), this.head = ref$.head, this.tails = ref$.tails;
      it.soak = true;
    }
    this.tails.push(it);
    if (this.head instanceof Super) {
      if (!this.head.called && it instanceof Call && !it.method) {
        it.method = '.call';
        it.args.unshift(Literal('this'));
        this.head.called = true;
      } else if (!this.tails[1] && ((ref$ = it.key) != null ? ref$.name : void 8) === 'prototype') {
        this.head.sproto = true;
      }
    }
    if (that = it.vivify, delete it.vivify, that) {
      this.head = Assign(Chain(this.head, this.tails.splice(0, 9e9)), that(), '=', '||');
    }
    return this;
  };
  prototype.unwrap = function(){
    if (this.tails.length) {
      return this;
    } else {
      return this.head;
    }
  };
  prototype.delegate(['getJump', 'assigns', 'isStatement', 'isString'], function(it, arg){
    return !this.tails.length && this.head[it](arg);
  });
  prototype.isComplex = function(){
    return this.tails.length || this.head.isComplex();
  };
  prototype.isCallable = function(){
    var that, ref$;
    if (that = (ref$ = this.tails)[ref$.length - 1]) {
      return !((ref$ = that.key) != null && ref$.items);
    } else {
      return this.head.isCallable();
    }
  };
  prototype.isArray = function(){
    var that, ref$;
    if (that = (ref$ = this.tails)[ref$.length - 1]) {
      return that.key instanceof Arr;
    } else {
      return this.head.isArray();
    }
  };
  prototype.isRegex = function(){
    return this.head.value === 'RegExp' && !this.tails[1] && this.tails[0] instanceof Call;
  };
  prototype.isAssignable = function(){
    var tail, ref$, i$, len$;
    if (!(tail = (ref$ = this.tails)[ref$.length - 1])) {
      return this.head.isAssignable();
    }
    if (!(tail instanceof Index) || tail.key instanceof List || tail.symbol === '.~') {
      return false;
    }
    for (i$ = 0, len$ = (ref$ = this.tails).length; i$ < len$; ++i$) {
      tail = ref$[i$];
      if (tail.assign) {
        return false;
      }
    }
    return true;
  };
  prototype.isSimpleAccess = function(){
    return this.tails.length === 1 && !this.head.isComplex() && !this.tails[0].isComplex();
  };
  prototype.makeReturn = function(it){
    if (this.tails.length) {
      return superclass.prototype.makeReturn.apply(this, arguments);
    } else {
      return this.head.makeReturn(it);
    }
  };
  prototype.getCall = function(){
    var tail, ref$;
    return (tail = (ref$ = this.tails)[ref$.length - 1]) instanceof Call && tail;
  };
  prototype.varName = function(){
    var ref$, ref1$;
    return (ref$ = (ref1$ = this.tails)[ref1$.length - 1]) != null ? ref$.varName() : void 8;
  };
  prototype.cacheReference = function(o){
    var name, ref$, base, ref, bref, nref;
    name = (ref$ = this.tails)[ref$.length - 1];
    if (name instanceof Call) {
      return this.cache(o, true);
    }
    if (this.tails.length < 2 && !this.head.isComplex() && !(name != null && name.isComplex())) {
      return [this, this];
    }
    base = Chain(this.head, this.tails.slice(0, -1));
    if (base.isComplex()) {
      ref = o.scope.temporary();
      base = Chain(Assign(Var(ref), base));
      bref = (ref$ = Var(ref), ref$.temp = true, ref$);
    }
    if (!name) {
      return [base, bref];
    }
    if (name.isComplex()) {
      ref = o.scope.temporary('key');
      name = Index(Assign(Var(ref), name.key));
      nref = Index((ref$ = Var(ref), ref$.temp = true, ref$));
    }
    return [base.add(name), Chain(bref || base.head, [nref || name])];
  };
  prototype.compileNode = function(o){
    var head, tails, that, base, news, rest, i$, ref$, len$, t;
    head = this.head, tails = this.tails;
    head.front = this.front;
    head.newed = this.newed;
    if (!tails.length) {
      return head.compile(o);
    }
    if (that = this.unfoldAssign(o)) {
      return that.compile(o);
    }
    if (tails[0] instanceof Call && !head.isCallable()) {
      this.carp('invalid callee');
    }
    this.expandSlice(o);
    this.expandBind(o);
    this.expandSplat(o);
    this.expandStar(o);
    if (!this.tails.length) {
      return this.head.compile(o);
    }
    base = this.head.compile(o, LEVEL_CALL);
    news = rest = '';
    for (i$ = 0, len$ = (ref$ = this.tails).length; i$ < len$; ++i$) {
      t = ref$[i$];
      if (t['new']) {
        news += 'new ';
      }
      rest += t.compile(o);
    }
    if ('.' === rest.charAt(0) && SIMPLENUM.test(base)) {
      base += ' ';
    }
    return news + base + rest;
  };
  prototype.unfoldSoak = function(o){
    var that, ref$, i, len$, node, ref1$, bust, test;
    if (that = this.head.unfoldSoak(o)) {
      (ref$ = that.then.tails).push.apply(ref$, this.tails);
      return that;
    }
    for (i = 0, len$ = (ref$ = this.tails).length; i < len$; ++i) {
      node = ref$[i];
      if (ref1$ = node.soak, delete node.soak, ref1$) {
        bust = Chain(this.head, this.tails.splice(0, i));
        if (node.assign && !bust.isAssignable()) {
          node.carp('invalid accessign');
        }
        test = node instanceof Call
          ? (ref1$ = bust.cacheReference(o), test = ref1$[0], this.head = ref1$[1], JS("typeof " + test.compile(o, LEVEL_OP) + " == 'function'"))
          : (i && node.assign
            ? (ref1$ = bust.cacheReference(o), test = ref1$[0], bust = ref1$[1], this.head = bust.head, (ref1$ = this.tails).unshift.apply(ref1$, bust.tails))
            : (ref1$ = bust.unwrap().cache(o, true), test = ref1$[0], this.head = ref1$[1]), Existence(test));
        return ref1$ = If(test, this), ref1$.soak = true, ref1$.cond = this.cond, ref1$['void'] = this['void'], ref1$;
      }
    }
  };
  prototype.unfoldAssign = function(o){
    var that, ref$, i, len$, index, op, left, lefts, rites, len1$, node, ref1$;
    if (that = this.head.unfoldAssign(o)) {
      (ref$ = that.right.tails).push.apply(ref$, this.tails);
      return that;
    }
    for (i = 0, len$ = (ref$ = this.tails).length; i < len$; ++i) {
      index = ref$[i];
      if (op = index.assign) {
        index.assign = '';
        left = Chain(this.head, this.tails.splice(0, i)).expandSlice(o).unwrap();
        if (left instanceof Arr) {
          lefts = left.items;
          rites = (this.head = Arr()).items;
          for (i = 0, len1$ = lefts.length; i < len1$; ++i) {
            node = lefts[i];
            ref1$ = Chain(node).cacheReference(o), rites[i] = ref1$[0], lefts[i] = ref1$[1];
          }
        } else {
          ref1$ = Chain(left).cacheReference(o), left = ref1$[0], this.head = ref1$[1];
        }
        if (op === '=') {
          op = ':=';
        }
        return ref1$ = Assign(left, this, op), ref1$.access = true, ref1$;
      }
    }
  };
  prototype.expandSplat = function(o){
    var tails, i, call, args, ctx, ref$;
    tails = this.tails;
    i = -1;
    while (call = tails[++i]) {
      if (!(args = call.args)) {
        continue;
      }
      ctx = call.method === '.call' && (args = args.concat()).shift();
      if (!(args = Splat.compileArray(o, args, true))) {
        continue;
      }
      if (call['new']) {
        this.carp('splatting "new"');
      }
      if (!ctx && tails[i - 1] instanceof Index) {
        ref$ = Chain(this.head, tails.splice(0, i - 1)).cache(o, true), this.head = ref$[0], ctx = ref$[1];
        i = 0;
      }
      call.method = '.apply';
      call.args = [ctx || Literal('null'), JS(args)];
    }
  };
  prototype.expandBind = function(o){
    var tails, i, that, obj, key, call;
    tails = this.tails;
    i = -1;
    while (that = tails[++i]) {
      if (that.symbol !== '.~') {
        continue;
      }
      that.symbol = '';
      obj = Chain(this.head, tails.splice(0, i)).unwrap();
      key = tails.shift().key;
      call = Call.make(Util('bind'), [obj, (key.reserved = true, key)]);
      this.head = this.newed ? Parens(call, true) : call;
      i = -1;
    }
  };
  prototype.expandStar = function(o){
    var tails, i, that, stars, ref$, sub, ref, temps, value, i$, len$, star;
    tails = this.tails;
    i = -1;
    while (that = tails[++i]) {
      if (that.args || that.stars || that.key instanceof Key) {
        continue;
      }
      stars = that.stars = [];
      that.eachChild(seek);
      if (!stars.length) {
        continue;
      }
      ref$ = Chain(this.head, tails.splice(0, i)).unwrap().cache(o), sub = ref$[0], ref = ref$[1], temps = ref$[2];
      value = Chain(ref, [Index(Key('length'))]).compile(o);
      for (i$ = 0, len$ = stars.length; i$ < len$; ++i$) {
        star = stars[i$];
        star.value = value;
        star.isAssignable = YES;
      }
      this.head = JS(sub.compile(o, LEVEL_CALL) + tails.shift().compile(o));
      if (temps) {
        o.scope.free(temps[0]);
      }
      i = -1;
    }
    function seek(it){
      if (it.value === '*') {
        stars.push(it);
      } else if (!(it instanceof Index)) {
        it.eachChild(seek);
      }
    }
  };
  prototype.expandSlice = function(o, assign){
    var tails, i, tail, ref$, _$;
    tails = this.tails;
    i = -1;
    while (tail = tails[++i]) {
      if ((ref$ = tail.key) != null && ref$.items) {
        if (tails[i + 1] instanceof Call) {
          tail.carp('calling a slice');
        }
        _$ = (_$ = tails.splice(0, i + 1), _$.pop().key.toSlice(o, Chain(this.head, _$).unwrap(), tail.symbol, assign));
this.head = (_$.front = this.front, _$);
        i = -1;
      }
    }
    return this;
  };
  return Chain;
}(Node));
exports.Call = Call = (function(superclass){
  Call.displayName = 'Call';
  var prototype = extend$(Call, superclass).prototype, constructor = Call;
  function Call(args){
    var splat, this$ = this instanceof ctor$ ? this : new ctor$;
    args || (args = []);
    if (args.length === 1 && (splat = args[0]) instanceof Splat) {
      if (splat.filler) {
        this$.method = '.call';
        args[0] = Literal('this');
        args[1] = Splat(Literal('arguments'));
      } else if (splat.it instanceof Arr) {
        args = splat.it.items;
      }
    }
    this$.args = args;
    return this$;
  } function ctor$(){} ctor$.prototype = prototype;
  prototype.children = ['args'];
  prototype.show = function(){
    return [this['new']] + [this.method] + [this.soak ? '?' : void 8];
  };
  prototype.compile = function(o){
    var code, i, ref$, len$, a;
    code = (this.method || '') + '(';
    for (i = 0, len$ = (ref$ = this.args).length; i < len$; ++i) {
      a = ref$[i];
      code += (i ? ', ' : '') + a.compile(o, LEVEL_LIST);
    }
    return code + ')';
  };
  Call.make = function(callee, args){
    return Chain(callee).add(Call(args));
  };
  Call.block = function(fun, args, method){
    var ref$, ref1$;
    return ref$ = Parens(Chain(fun, [(ref1$ = Call(args), ref1$.method = method, ref1$)]), true), ref$.calling = true, ref$;
  };
  Call.back = function(params, node, bound){
    var fun, args, index, len$, a;
    fun = Fun(params, void 8, bound);
    if (fun['void'] = node.op === '!') {
      node = node.it;
    }
    if (node instanceof Label) {
      fun.name = node.label;
      fun.labeled = true;
      node = node.it;
    }
    if (!fun['void'] && (fun['void'] = node.op === '!')) {
      node = node.it;
    }
    args = (node.getCall() || (node = Chain(node).add(Call())).getCall()).args;
    for (index = 0, len$ = args.length; index < len$; ++index) {
      a = args[index];
      if (a.filler) {
        break;
      }
    }
    return node.back = (args[index] = fun).body, node;
  };
  Call['let'] = function(args, body){
    var params, res$, i, len$, a, that, gotThis;
    res$ = [];
    for (i = 0, len$ = args.length; i < len$; ++i) {
      a = args[i];
      if (that = a.op === '=' && !a.logic && a.right) {
        args[i] = that;
        if (i === 0 && (gotThis = a.left.value === 'this')) {
          continue;
        }
        res$.push(a.left);
      } else {
        res$.push(Var(a.varName() || a.carp('invalid "let" argument')));
      }
    }
    params = res$;
    gotThis || args.unshift(Literal('this'));
    return this.block(Fun(params, body), args, '.call');
  };
  return Call;
}(Node));
List = (function(superclass){
  List.displayName = 'List';
  var prototype = extend$(List, superclass).prototype, constructor = List;
  prototype.children = ['items'];
  prototype.show = function(){
    return this.name;
  };
  prototype.named = function(name){
    this.name = name;
    return this;
  };
  prototype.isEmpty = function(){
    return !this.items.length;
  };
  prototype.assigns = function(it){
    var i$, ref$, len$, node;
    for (i$ = 0, len$ = (ref$ = this.items).length; i$ < len$; ++i$) {
      node = ref$[i$];
      if (node.assigns(it)) {
        return true;
      }
    }
  };
  List.compile = function(o, items){
    var indent, level, code, i, that;
    switch (items.length) {
    case 0:
      return '';
    case 1:
      return items[0].compile(o, LEVEL_LIST);
    }
    indent = o.indent, level = o.level;
    o.indent = indent + TAB;
    o.level = LEVEL_LIST;
    code = items[i = 0].compile(o);
    while (that = items[++i]) {
      code += ', ' + that.compile(o);
    }
    if (~code.indexOf('\n')) {
      code = "\n" + o.indent + code + "\n" + indent;
    }
    o.indent = indent;
    o.level = level;
    return code;
  };
  function List(){}
  return List;
}(Node));
exports.Obj = Obj = (function(superclass){
  Obj.displayName = 'Obj';
  var prototype = extend$(Obj, superclass).prototype, constructor = Obj;
  function Obj(items){
    var this$ = this instanceof ctor$ ? this : new ctor$;
    this$.items = items || [];
    return this$;
  } function ctor$(){} ctor$.prototype = prototype;
  prototype.asObj = THIS;
  prototype.toSlice = function(o, base, symbol, assign){
    var items, ref$, ref, temps, i, len$, node, name, chain, logic, key, val;
    items = this.items;
    if (items.length > 1) {
      ref$ = base.cache(o), base = ref$[0], ref = ref$[1], temps = ref$[2];
    } else {
      ref = base;
    }
    for (i = 0, len$ = items.length; i < len$; ++i) {
      node = items[i];
      if (node.comment) {
        continue;
      }
      if (node instanceof Prop || node instanceof Splat) {
        node[name = (ref$ = node.children)[ref$.length - 1]] = chain = Chain(base, [Index(node[name].maybeKey())]);
      } else {
        if (logic = node.getDefault()) {
          node = node.first;
        }
        if (node instanceof Parens) {
          ref$ = node.cache(o, true), key = ref$[0], node = ref$[1];
          if (assign) {
            ref$ = [node, key], key = ref$[0], node = ref$[1];
          }
          key = Parens(key);
        } else {
          key = node;
        }
        val = chain = Chain(base, [Index(node.maybeKey(), symbol)]);
        if (logic) {
          val = (logic.first = val, logic);
        }
        items[i] = Prop(key, val);
      }
      base = ref;
    }
    chain || this.carp('empty slice');
    if (temps) {
      (chain.head = Var(temps[0])).temp = true;
    }
    return this;
  };
  prototype.compileNode = function(o){
    var items, code, idt, dic, i, len$, node, logic, rest, multi, key, val;
    items = this.items;
    if (!items.length) {
      return this.front ? '({})' : '{}';
    }
    code = '';
    idt = '\n' + (o.indent += TAB);
    dic = {};
    for (i = 0, len$ = items.length; i < len$; ++i) {
      node = items[i];
      if (node.comment) {
        code += idt + node.compile(o);
        continue;
      }
      if (logic = node.getDefault()) {
        node = node.first;
      }
      if (node instanceof Splat || (node.key || node) instanceof Parens) {
        rest = items.slice(i);
        break;
      }
      if (logic) {
        if (node instanceof Prop) {
          node.val = (logic.first = node.val, logic);
        } else {
          node = Prop(node, (logic.first = node, logic));
        }
      }
      if (multi) {
        code += ',';
      } else {
        multi = true;
      }
      code += idt + (node instanceof Prop
        ? (key = node.key, val = node.val, node.accessor
          ? node.compileAccessor(o, key = key.compile(o))
          : (val.ripName(key), (key = key.compile(o)) + ": " + val.compile(o, LEVEL_LIST)))
        : (key = node.compile(o)) + ": " + key);
      ID.test(key) || (key = Function("return " + key)());
      if (!(dic[key + "."] ^= 1)) {
        node.carp("duplicate property \"" + key + "\"");
      }
    }
    code = "{" + (code && code + '\n' + this.tab) + "}";
    rest && (code = Import(JS(code), Obj(rest)).compile((o.indent = this.tab, o)));
    if (this.front && '{' === code.charAt()) {
      return "(" + code + ")";
    } else {
      return code;
    }
  };
  return Obj;
}(List));
exports.Prop = Prop = (function(superclass){
  Prop.displayName = 'Prop';
  var prototype = extend$(Prop, superclass).prototype, constructor = Prop;
  function Prop(key, val){
    var that, i$, len$, fun, this$ = this instanceof ctor$ ? this : new ctor$;
    this$.key = key;
    this$.val = val;
    if (key.value === '...') {
      return Splat(this$.val);
    }
    if (that = val.getAccessors()) {
      this$.val = that;
      for (i$ = 0, len$ = that.length; i$ < len$; ++i$) {
        fun = that[i$];
        fun.x = (fun['void'] = fun.params.length) ? 's' : 'g';
      }
      this$['accessor'] = 'accessor';
    }
    return this$;
  } function ctor$(){} ctor$.prototype = prototype;
  prototype.children = ['key', 'val'];
  prototype.show = function(){
    return this.accessor;
  };
  prototype.assigns = function(it){
    var ref$;
    return typeof (ref$ = this.val).assigns == 'function' ? ref$.assigns(it) : void 8;
  };
  prototype.compileAccessor = function(o, key){
    var funs, fun;
    funs = this.val;
    if (funs[1] && funs[0].params.length + funs[1].params.length !== 1) {
      funs[0].carp('invalid accessor parameter');
    }
    return (function(){
      var i$, ref$, len$, results$ = [];
      for (i$ = 0, len$ = (ref$ = funs).length; i$ < len$; ++i$) {
        fun = ref$[i$];
        fun.accessor = true;
        results$.push(fun.x + "et " + key + fun.compile(o, LEVEL_LIST).slice(8));
      }
      return results$;
    }()).join(',\n' + o.indent);
  };
  prototype.compileDescriptor = function(o){
    var obj, i$, ref$, len$, fun;
    obj = Obj();
    for (i$ = 0, len$ = (ref$ = this.val).length; i$ < len$; ++i$) {
      fun = ref$[i$];
      obj.items.push(Prop(Key(fun.x + 'et'), fun));
    }
    obj.items.push(Prop(Key('configurable'), Literal(true)));
    obj.items.push(Prop(Key('enumerable'), Literal(true)));
    return obj.compile(o);
  };
  return Prop;
}(Node));
exports.Arr = Arr = (function(superclass){
  Arr.displayName = 'Arr';
  var prototype = extend$(Arr, superclass).prototype, constructor = Arr;
  function Arr(items){
    var this$ = this instanceof ctor$ ? this : new ctor$;
    this$.items = items || [];
    return this$;
  } function ctor$(){} ctor$.prototype = prototype;
  prototype.isArray = YES;
  prototype.asObj = function(){
    var i, item;
    return Obj((function(){
      var ref$, len$, results$ = [];
      for (i = 0, len$ = (ref$ = this.items).length; i < len$; ++i) {
        item = ref$[i];
        results$.push(Prop(Literal(i), item));
      }
      return results$;
    }.call(this)));
  };
  prototype.toSlice = function(o, base, symbol){
    var items, ref$, ref, i, len$, item, splat, chain;
    items = this.items;
    if (items.length > 1) {
      ref$ = base.cache(o), base = ref$[0], ref = ref$[1];
    } else {
      ref = base;
    }
    for (i = 0, len$ = items.length; i < len$; ++i) {
      item = items[i];
      if (splat = item instanceof Splat) {
        item = item.it;
      }
      if (item.isEmpty()) {
        continue;
      }
      chain = Chain(base, [Index(item, symbol)]);
      items[i] = splat ? Splat(chain) : chain;
      base = ref;
    }
    chain || this.carp('empty slice');
    return this;
  };
  prototype.compile = function(o){
    var items, code;
    items = this.items;
    if (!items.length) {
      return '[]';
    }
    if (code = Splat.compileArray(o, items)) {
      return this.newed ? "(" + code + ")" : code;
    }
    return "[" + List.compile(o, items) + "]";
  };
  Arr.maybe = function(nodes){
    if (nodes.length === 1 && !(nodes[0] instanceof Splat)) {
      return nodes[0];
    }
    return constructor(nodes);
  };
  Arr.wrap = function(it){
    return constructor([Splat((it.isArray = YES, it))]);
  };
  return Arr;
}(List));
exports.Unary = Unary = (function(superclass){
  Unary.displayName = 'Unary';
  var prototype = extend$(Unary, superclass).prototype, constructor = Unary;
  function Unary(op, it, flag){
    var that, i$, ref$, len$, node, this$ = this instanceof ctor$ ? this : new ctor$;
    if (that = !flag && it.unaries) {
      that.push(op);
      return it;
    }
    switch (op) {
    case '!':
      if (flag) {
        break;
      }
      if (it instanceof Fun && !it['void']) {
        return it['void'] = true, it;
      }
      return it.invert();
    case '++':
    case '--':
      if (flag) {
        this$.post = true;
      }
      break;
    case 'new':
      if (it instanceof Existence && !it.negated) {
        it = Chain(it).add(Call());
      }
      it.newed = true;
      for (i$ = 0, len$ = (ref$ = it.tails || '').length; i$ < len$; ++i$) {
        node = ref$[i$];
        if (node instanceof Call && !node['new']) {
          if (node.method === '.call') {
            node.args.shift();
          }
          node['new'] = 'new';
          node.method = '';
          return it;
        }
      }
      break;
    case '~':
      if (it instanceof Fun && it.statement && !it.bound) {
        return it.bound = 'this$', it;
      }
    }
    this$.op = op;
    this$.it = it;
    return this$;
  } function ctor$(){} ctor$.prototype = prototype;
  prototype.children = ['it'];
  prototype.show = function(){
    return [this.post ? '@' : void 8] + this.op;
  };
  prototype.isCallable = function(){
    var ref$;
    return (ref$ = this.op) === 'do' || ref$ === 'new' || ref$ === 'delete';
  };
  prototype.isArray = function(){
    return this.it instanceof Arr && this.it.items.length || this.it instanceof Chain && this.it.isArray();
  };
  prototype.isString = function(){
    var ref$;
    return (ref$ = this.op) === 'typeof' || ref$ === 'classof';
  };
  prototype.invert = function(){
    var ref$;
    if (this.op === '!' && ((ref$ = this.it.op) === '!' || ref$ === '<' || ref$ === '>' || ref$ === '<=' || ref$ === '>=' || ref$ === 'in' || ref$ === 'instanceof')) {
      return this.it;
    }
    return constructor('!', this, true);
  };
  prototype.unfoldSoak = function(o){
    var ref$;
    return ((ref$ = this.op) === '++' || ref$ === '--' || ref$ === 'delete') && If.unfoldSoak(o, this, 'it');
  };
  prototype.getAccessors = function(){
    var items;
    if (this.op !== '~') {
      return;
    }
    if (this.it instanceof Fun) {
      return [this.it];
    }
    if (this.it instanceof Arr) {
      items = this.it.items;
      if (!items[2] && items[0] instanceof Fun && items[1] instanceof Fun) {
        return items;
      }
    }
  };
  function crement(it){
    return {
      '++': 'in',
      '--': 'de'
    }[it] + 'crement';
  }
  prototype.compileNode = function(o){
    var that, op, it, _$, code;
    if (that = this.compileSpread(o)) {
      return that;
    }
    op = this.op, it = this.it;
    switch (op) {
    case '!':
      it.cond = true;
      break;
    case 'new':
      it.isCallable() || it.carp('invalid constructor');
      break;
    case 'do':
      _$ = Parens(it instanceof Existence && !it.negated
        ? Chain(it).add(Call())
        : Call.make(it));
return (_$.front = this.front, _$.newed = this.newed, _$).compile(o);;
      break;
    case 'delete':
      if (it instanceof Var || !it.isAssignable()) {
        this.carp('invalid delete');
      }
      if (o.level && !this['void']) {
        return this.compilePluck(o);
      }
      break;
    case '++':
    case '--':
      it.isAssignable() || this.carp('invalid ' + crement(op));
      if (that = it instanceof Var && o.scope.checkReadOnly(it.value)) {
        this.carp(crement(op) + " of " + that + " \"" + it.value + "\"");
      }
      if (this.post) {
        it.front = this.front;
      }
      break;
    case '^':
      return util('clone') + "(" + it.compile(o, LEVEL_LIST) + ")";
    case 'classof':
      return util('toString') + ".call(" + it.compile(o, LEVEL_LIST) + ").slice(8, -1)";
    }
    code = it.compile(o, LEVEL_OP + PREC.unary);
    if (this.post) {
      code += op;
    } else {
      if ((op === 'new' || op === 'typeof' || op === 'delete') || (op === '+' || op === '-') && op === code.charAt()) {
        op += ' ';
      }
      code = op + code;
    }
    if (o.level < LEVEL_CALL) {
      return code;
    } else {
      return "(" + code + ")";
    }
  };
  prototype.compileSpread = function(o){
    var it, ops, them, i, len$, node, sp, i$, op, lat, ref$;
    it = this.it;
    ops = [this];
    for (; it instanceof constructor; it = it.it) {
      ops.push(it);
    }
    if (!((it = it.expandSlice(o).unwrap()) instanceof Arr && (them = it.items).length)) {
      return '';
    }
    for (i = 0, len$ = them.length; i < len$; ++i) {
      node = them[i];
      if (sp = node instanceof Splat) {
        node = node.it;
      }
      for (i$ = ops.length - 1; i$ >= 0; --i$) {
        op = ops[i$];
        node = constructor(op.op, node, op.post);
      }
      them[i] = sp ? lat = Splat(node) : node;
    }
    if (!lat && (this['void'] || !o.level)) {
      it = (ref$ = Block(them), ref$.front = this.front, ref$['void'] = true, ref$);
    }
    return it.compile(o, LEVEL_PAREN);
  };
  prototype.compilePluck = function(o){
    var ref$, get, del, code, ref;
    ref$ = Chain(this.it).cacheReference(o), get = ref$[0], del = ref$[1];
    code = this.assigned
      ? ''
      : (ref = o.scope.temporary()) + " = ";
    code += get.compile(o, LEVEL_LIST) + ", delete " + del.compile(o, LEVEL_LIST);
    if (this.assigned) {
      return code;
    }
    code += ", " + o.scope.free(ref);
    if (o.level < LEVEL_LIST) {
      return code;
    } else {
      return "(" + code + ")";
    }
  };
  return Unary;
}(Node));
exports.Binary = Binary = (function(superclass){
  Binary.displayName = 'Binary';
  var COMPARER, INVERSIONS, prototype = extend$(Binary, superclass).prototype, constructor = Binary;
  function Binary(op, first, second){
    var this$ = this instanceof ctor$ ? this : new ctor$;
    switch (op) {
    case 'of':
      return new Of(first, second);
    }
    this$.op = op;
    this$.first = first;
    this$.second = second;
    return this$;
  } function ctor$(){} ctor$.prototype = prototype;
  prototype.children = ['first', 'second'];
  prototype.show = function(){
    return this.op;
  };
  prototype.isCallable = function(){
    var ref$;
    return ((ref$ = this.op) === '&&' || ref$ === '||' || ref$ === '?' || ref$ === '!?') && this.first.isCallable() && this.second.isCallable();
  };
  prototype.isArray = function(){
    switch (this.op) {
    case '*':
      return this.first.isArray();
    case '/':
      return this.second.isMatcher();
    }
  };
  prototype.isString = function(){
    switch (this.op) {
    case '+':
    case '*':
      return this.first.isString() || this.second.isString();
    case '-':
      return this.second.isMatcher();
    }
  };
  COMPARER = /^(?:[!=]=|[<>])=?$/;
  INVERSIONS = {
    '===': '!==',
    '!==': '===',
    '==': '!=',
    '!=': '=='
  };
  prototype.invert = function(){
    var that;
    if (that = !COMPARER.test(this.second.op) && INVERSIONS[this.op]) {
      this.op = that;
      return this;
    }
    return Unary('!', Parens(this), true);
  };
  prototype.getDefault = function(){
    switch (this.op) {
    case '?':
    case '||':
    case '&&':
    case '!?':
      return this;
    }
  };
  prototype.compileNode = function(o){
    var top, rite, items, code, level;
    switch (this.op) {
    case '?':
    case '!?':
      return this.compileExistence(o);
    case '*':
      if (this.second.isString()) {
        return this.compileJoin(o);
      }
      if (this.first.isString() || this.first.isArray()) {
        return this.compileRepeat(o);
      }
      break;
    case '-':
      if (this.second.isMatcher()) {
        return this.compileRemove(o);
      }
      break;
    case '/':
      if (this.second.isMatcher()) {
        return this.compileSplit(o);
      }
      break;
    case '**':
      return this.compilePow(o);
    case '<?':
    case '>?':
      return this.compileMinMax(o);
    case '&&':
    case '||':
      if (top = this['void'] || !o.level) {
        this.second['void'] = true;
      }
      if (top || this.cond) {
        this.first.cond = true;
        this.second.cond = true;
      }
      break;
    case 'instanceof':
      rite = this.second.expandSlice(o).unwrap(), items = rite.items;
      if (rite instanceof Arr) {
        if (items[1]) {
          return this.compileAnyInstanceOf(o, items);
        }
        this.second = items[0] || rite;
      }
      this.second.isCallable() || this.second.carp('invalid instanceof operand');
      break;
    default:
      if (COMPARER.test(this.op) && COMPARER.test(this.second.op)) {
        return this.compileChain(o);
      }
    }
    this.first.front = this.front;
    code = this.first.compile(o, level = LEVEL_OP + PREC[this.op]) + " " + this.op + " " + this.second.compile(o, level);
    if (o.level <= level) {
      return code;
    } else {
      return "(" + code + ")";
    }
  };
  prototype.compileChain = function(o){
    var code, level, ref$, sub;
    code = this.first.compile(o, level = LEVEL_OP + PREC[this.op]);
    ref$ = this.second.first.cache(o, true), sub = ref$[0], this.second.first = ref$[1];
    code += " " + this.op + " " + sub.compile(o, level) + " && " + this.second.compile(o, LEVEL_OP);
    if (o.level <= LEVEL_OP) {
      return code;
    } else {
      return "(" + code + ")";
    }
  };
  prototype.compileExistence = function(o){
    var _$, ref$;
    if (this.op === '!?') {
      _$ = (ref$ = If(Existence(this.first), this.second), ref$.cond = this.cond, ref$['void'] = this['void'] || !o.level, ref$);
return _$.compileExpression(o);;
    }
    if (this['void'] || !o.level) {
      _$ = Binary('&&', Existence(this.first, true), this.second);
return (_$['void'] = true, _$).compileNode(o);;
    }
    return (_$ = this.first.cache(o, true), If(Existence(_$[0]), _$[1]).addElse(this.second).compileExpression(o));
  };
  prototype.compileAnyInstanceOf = function(o, items){
    var ref$, sub, ref, test, i$, len$, item;
    ref$ = this.first.cache(o), sub = ref$[0], ref = ref$[1], this.temps = ref$[2];
    test = Binary('instanceof', sub, items.shift());
    for (i$ = 0, len$ = items.length; i$ < len$; ++i$) {
      item = items[i$];
      test = Binary('||', test, Binary('instanceof', ref, item));
    }
    return Parens(test).compile(o);
  };
  prototype.compileMinMax = function(o){
    var lefts, rites, _$;
    lefts = this.first.cache(o, true);
    rites = this.second.cache(o, true);
    return (_$ = Binary(this.op.charAt(), lefts[0], rites[0]), If(_$, lefts[1]).addElse(rites[1]).compileExpression(o));
  };
  prototype.compileMethod = function(o, klass, method, arg){
    var args;
    args = [this.second].concat(arg || []);
    if (this.first["is" + klass]()) {
      return Chain(this.first, [Index(Key(method)), Call(args)]).compile(o);
    } else {
      args.unshift(this.first);
      return Call.make(JS(util(method) + '.call'), args).compile(o);
    }
  };
  prototype.compileJoin = function(it){
    return this.compileMethod(it, 'Array', 'join');
  };
  prototype.compileRemove = function(it){
    return this.compileMethod(it, 'String', 'replace', JS("''"));
  };
  prototype.compileSplit = function(it){
    return this.compileMethod(it, 'String', 'split');
  };
  prototype.compileRepeat = function(o){
    var x, n, items, arr, that, refs, i, len$, item, ref$, q;
    x = this.first, n = this.second;
    items = (x = x.expandSlice(o).unwrap()).items;
    arr = x.isArray() && 'Array';
    if (that = items && Splat.compileArray(o, items)) {
      x = JS(that);
      items = null;
    }
    if (arr && !items || !(n instanceof Literal && n.value < 0x20)) {
      return Call.make(Util('repeat' + (arr || 'String')), [x, n]).compile(o);
    }
    n = +n.value;
    if (1 <= n && n < 2) {
      return x.compile(o);
    }
    if (items) {
      if (n < 1) {
        return Block(items).add(JS('[]')).compile(o);
      }
      refs = [];
      for (i = 0, len$ = items.length; i < len$; ++i) {
        item = items[i];
        ref$ = item.cache(o, 1), items[i] = ref$[0], refs[refs.length] = ref$[1];
      }
      items.push((ref$ = JS(), ref$.compile = function(){
        return (repeatString$(", " + List.compile(o, refs), n - 1)).slice(2);
      }, ref$));
      return x.compile(o);
    } else if (x instanceof Literal) {
      return (q = (x = x.compile(o)).charAt()) + repeatString$(x.slice(1, -1) + "", n) + q;
    } else {
      if (n < 1) {
        return Block(x.it).add(JS("''")).compile(o);
      }
      x = (refs = x.cache(o, 1, LEVEL_OP))[0] + repeatString$(" + " + refs[1], n - 1);
      if (o.level < LEVEL_OP + PREC['+']) {
        return x;
      } else {
        return "(" + x + ")";
      }
    }
  };
  prototype.compilePow = function(o){
    return Call.make(JS('Math.pow'), [this.first, this.second]).compile(o);
  };
  return Binary;
}(Node));
exports.Assign = Assign = (function(superclass){
  Assign.displayName = 'Assign';
  var prototype = extend$(Assign, superclass).prototype, constructor = Assign;
  function Assign(left, rite, op, logic){
    var this$ = this instanceof ctor$ ? this : new ctor$;
    this$.left = left;
    this$.op = op || '=';
    this$.logic = logic || this$.op.logic;
    this$.op += '';
    this$[rite instanceof Node ? 'right' : 'unaries'] = rite;
    return this$;
  } function ctor$(){} ctor$.prototype = prototype;
  prototype.children = ['left', 'right'];
  prototype.show = function(){
    return [void 8].concat(this.unaries).reverse().join(' ') + [this.logic] + this.op;
  };
  prototype.assigns = function(it){
    return this.left.assigns(it);
  };
  prototype.delegate(['isCallable', 'isRegex'], function(it){
    var ref$;
    return ((ref$ = this.op) === '=' || ref$ === ':=') && this.right[it]();
  });
  prototype.isArray = function(){
    switch (this.op) {
    case '=':
    case ':=':
      return this.right.isArray();
    case '/=':
      return this.right.isMatcher();
    }
  };
  prototype.isString = function(){
    switch (this.op) {
    case '=':
    case ':=':
    case '+=':
    case '*=':
      return this.right.isString();
    case '-=':
      return this.right.isMatcher();
    }
  };
  prototype.unfoldSoak = function(o){
    var that, ref$, rite, temps;
    if (this.left instanceof Existence) {
      if (that = (ref$ = this.left = this.left.it).name, delete ref$.name, that) {
        rite = this.right;
        rite = Assign(this.right = Var(that), rite);
      } else {
        ref$ = this.right.cache(o), rite = ref$[0], this.right = ref$[1], temps = ref$[2];
      }
      return ref$ = If(Existence(rite), this), ref$.temps = temps, ref$.cond = this.cond, ref$['void'] = this['void'], ref$;
    }
    return If.unfoldSoak(o, this, 'left');
  };
  prototype.unfoldAssign = function(){
    return this.access && this;
  };
  prototype.compileNode = function(o){
    var left, ref$, i$, len$, op, right, reft, code, name, lvar, del, that, res;
    left = this.left.expandSlice(o, true).unwrap();
    if (!this.right) {
      left.isAssignable() || left.carp('invalid unary assign');
      ref$ = Chain(left).cacheReference(o), left = ref$[0], this.right = ref$[1];
      for (i$ = 0, len$ = (ref$ = this.unaries).length; i$ < len$; ++i$) {
        op = ref$[i$];
        this.right = Unary(op, this.right);
      }
    }
    if (left.isEmpty()) {
      return (ref$ = Parens(this.right), ref$.front = this.front, ref$.newed = this.newed, ref$).compile(o);
    }
    if (left.getDefault()) {
      this.right = Binary(left.op, this.right, left.second);
      left = left.first;
    }
    if (left.items) {
      return this.compileDestructuring(o, left);
    }
    left.isAssignable() || left.carp('invalid assign');
    if (this.logic) {
      return this.compileConditional(o, left);
    }
    op = this.op, right = this.right;
    if (op === '<?=' || op === '>?=') {
      return this.compileMinMax(o, left, right);
    }
    if (op === '**=' || op === '*=' && right.isString() || (op === '-=' || op === '/=') && right.isMatcher()) {
      ref$ = Chain(left).cacheReference(o), left = ref$[0], reft = ref$[1];
      right = Binary(op.slice(0, -1), reft, right);
      op = ':=';
    }
    (right = right.unparen()).ripName(left = left.unwrap());
    code = name = (left.front = true, left).compile(o, LEVEL_LIST);
    if (lvar = left instanceof Var) {
      del = right.op === 'delete';
      if (op === '=') {
        o.scope.declare(name, left, this['const']);
      } else if (that = o.scope.checkReadOnly(name)) {
        left.carp("assignment to " + that + " \"" + name + "\"");
      }
    }
    code += " " + (replace$.call(op, ':', '')) + " ";
    code = !o.level && right instanceof While && !right['else'] && (lvar || left.isSimpleAccess())
      ? (res = o.scope.temporary('res')) + " = [];\n" + this.tab + right.makeReturn(res).compile(o) + "\n" + this.tab + code + o.scope.free(res)
      : code + (right.assigned = true, right).compile(o, LEVEL_LIST);
    if (that = o.level) {
      if (del) {
        code += ", " + name;
      }
      if (that > (del ? LEVEL_PAREN : LEVEL_LIST)) {
        code = "(" + code + ")";
      }
    }
    return code;
  };
  prototype.compileConditional = function(o, left){
    var ref$, lefts, morph;
    if (left instanceof Var && ((ref$ = this.logic) === '?' || ref$ === '!?') && this.op === '=') {
      o.scope.declare(left.value, left);
    }
    lefts = Chain(left).cacheReference(o);
    o.level += LEVEL_OP < o.level;
    morph = Binary(this.logic, lefts[0], (this.logic = false, this.left = lefts[1], this));
    return (morph['void'] = this['void'], morph).compileNode(o);
  };
  prototype.compileMinMax = function(o, left, right){
    var lefts, rites, test, put, ref$;
    lefts = Chain(left).cacheReference(o);
    rites = right.cache(o, true);
    test = Binary(this.op.replace('?', ''), lefts[0], rites[0]);
    put = Assign(lefts[1], rites[1], ':=');
    if (this['void'] || !o.level) {
      return Parens(Binary('||', test, put)).compile(o);
    }
    ref$ = test.first.cache(o, true), test.first = ref$[0], left = ref$[1];
    return If(test, left).addElse(put).compileExpression(o);
  };
  prototype.compileDestructuring = function(o, left){
    var items, len, ret, rite, that, cache, rref, list, code;
    items = left.items, len = items.length;
    ret = o.level && !this['void'];
    rite = this.right.compile(o, len === 1 ? LEVEL_CALL : LEVEL_LIST);
    if (that = left.name) {
      cache = that + " = " + rite;
      o.scope.declare(rite = that, left);
    } else if ((ret || len > 1) && (!ID.test(rite) || left.assigns(rite))) {
      cache = (rref = o.scope.temporary()) + " = " + rite;
      rite = rref;
    }
    list = this["rend" + left.constructor.displayName](o, items, rite);
    if (rref) {
      o.scope.free(rref);
    }
    if (cache) {
      list.unshift(cache);
    }
    if (ret || !list.length) {
      list.push(rite);
    }
    code = list.join(', ');
    if (list.length < 2 || o.level < LEVEL_LIST) {
      return code;
    } else {
      return "(" + code + ")";
    }
  };
  prototype.rendArr = function(o, nodes, rite){
    var i, len$, node, skip, len, val, ivar, start, inc, rcache, ref$, results$ = [];
    for (i = 0, len$ = nodes.length; i < len$; ++i) {
      node = nodes[i];
      if (node.isEmpty()) {
        continue;
      }
      if (node instanceof Splat) {
        len && node.carp('multiple splat in an assignment');
        skip = (node = node.it).isEmpty();
        if (i + 1 === (len = nodes.length)) {
          if (skip) {
            break;
          }
          val = Arr.wrap(JS(util('slice') + '.call(' + rite + (i ? ", " + i + ")" : ')')));
        } else {
          val = ivar = rite + ".length - " + (len - i - 1);
          if (skip && i + 2 === len) {
            continue;
          }
          start = i + 1;
          this.temps = [ivar = o.scope.temporary('i')];
          val = skip
            ? (node = Var(ivar), Var(val))
            : Arr.wrap(JS(i + " < (" + ivar + " = " + val + ")\ ? " + util('slice') + ".call(" + rite + ", " + i + ", " + ivar + ")\ : (" + ivar + " = " + i + ", [])"));
        }
      } else {
        (inc = ivar) && start < i && (inc += " + " + (i - start));
        val = Chain(rcache || (rcache = Literal(rite)), [Index(JS(inc || i))]);
      }
      results$.push((ref$ = clone$(this), ref$.left = node, ref$.right = val, ref$['void'] = true, ref$).compile(o, LEVEL_PAREN));
    }
    return results$;
  };
  prototype.rendObj = function(o, nodes, rite){
    var i$, len$, node, splat, logic, ref$, key, val, rcache, results$ = [];
    for (i$ = 0, len$ = nodes.length; i$ < len$; ++i$) {
      node = nodes[i$];
      if (splat = node instanceof Splat) {
        node = node.it;
      }
      if (logic = node.getDefault()) {
        node = node.first;
      }
      if (node instanceof Parens) {
        ref$ = Chain(node.it).cacheReference(o), node = ref$[0], key = ref$[1];
      } else if (node instanceof Prop) {
        node = (key = node.key, node).val;
      } else {
        key = node;
      }
      if (node instanceof Key) {
        node = Var(node.name);
      }
      if (logic) {
        node = (logic.first = node, logic);
      }
      val = Chain(rcache || (rcache = Var(rite)), [Index(key.maybeKey())]);
      if (splat) {
        val = Import(Obj(), val);
      }
      results$.push((ref$ = clone$(this), ref$.left = node, ref$.right = val, ref$['void'] = true, ref$).compile(o, LEVEL_PAREN));
    }
    return results$;
  };
  return Assign;
}(Node));
exports.Import = Import = (function(superclass){
  Import.displayName = 'Import';
  var prototype = extend$(Import, superclass).prototype, constructor = Import;
  function Import(left, right, all){
    var this$ = this instanceof ctor$ ? this : new ctor$;
    this$.left = left;
    this$.right = right;
    this$.all = all && 'All';
    if (!all && left instanceof Obj && right.items) {
      return Obj(left.items.concat(right.asObj().items));
    }
    return this$;
  } function ctor$(){} ctor$.prototype = prototype;
  prototype.children = ['left', 'right'];
  prototype.show = function(){
    return this.all;
  };
  prototype.delegate(['isCallable', 'isArray'], function(it){
    return this.left[it]();
  });
  prototype.unfoldSoak = function(o){
    var left, value, ref$, temps;
    left = this.left;
    if (left instanceof Existence && !left.negated) {
      if ((left = left.it) instanceof Var) {
        value = (this.left = left).value;
        if (!o.scope.check(value, true)) {
          left = JS("typeof " + value + " != 'undefined' && " + value);
        }
      } else {
        ref$ = left.cache(o), left = ref$[0], this.left = ref$[1], temps = ref$[2];
      }
      return ref$ = If(left, this), ref$.temps = temps, ref$.soak = true, ref$.cond = this.cond, ref$['void'] = this['void'], ref$;
    }
    return If.unfoldSoak(o, this, 'left') || (this['void'] || !o.level) && If.unfoldSoak(o, this, 'right');
  };
  prototype.compileNode = function(o){
    var right;
    right = this.right;
    if (!this.all) {
      if (right instanceof Chain) {
        right = right.unfoldSoak(o) || right.unfoldAssign(o) || right.expandSlice(o).unwrap();
      }
      if (right instanceof List) {
        return this.compileAssign(o, right.asObj().items);
      }
    }
    return Call.make(Util("import" + (this.all || '')), [this.left, right]).compileNode(o);
  };
  prototype.compileAssign = function(o, items){
    var top, reft, ref$, left, delim, space, code, i, len$, node, com, logic, dyna, key, val;
    if (!items.length) {
      return this.left.compile(o);
    }
    top = !o.level;
    if (items.length < 2 && (top || this['void'] || items[0] instanceof Splat)) {
      reft = this.left;
      if (reft.isComplex()) {
        reft = Parens(reft);
      }
    } else {
      ref$ = this.left.cache(o), left = ref$[0], reft = ref$[1], this.temps = ref$[2];
    }
    ref$ = top
      ? [';', '\n' + this.tab]
      : [',', ' '], delim = ref$[0], space = ref$[1];
    delim += space;
    code = this.temps ? left.compile(o, LEVEL_PAREN) + delim : '';
    for (i = 0, len$ = items.length; i < len$; ++i) {
      node = items[i];
      i && (code += com ? space : delim);
      if (com = node.comment) {
        code += node.compile(o);
        continue;
      }
      if (node instanceof Splat) {
        code += Import(reft, node.it).compile(o);
        continue;
      }
      if (logic = node.getDefault()) {
        node = node.first;
      }
      if (dyna = node instanceof Parens) {
        ref$ = node.it.cache(o, true), key = ref$[0], val = ref$[1];
      } else if (node instanceof Prop) {
        key = node.key, val = node.val;
        if (node.accessor) {
          if (key instanceof Key) {
            key = JS("'" + key.name + "'");
          }
          code += "Object.defineProperty(" + reft.compile(o, LEVEL_LIST) + ", " + key.compile(o, LEVEL_LIST) + ", " + node.compileDescriptor(o) + ")";
          continue;
        }
      } else {
        key = val = node;
      }
      dyna || (key = key.maybeKey());
      logic && (val = (logic.first = val, logic));
      code += Assign(Chain(reft, [Index(key)]), val).compile(o, LEVEL_PAREN);
    }
    if (top) {
      return code;
    }
    this['void'] || node instanceof Splat || (code += (com ? ' ' : ', ') + reft.compile(o, LEVEL_PAREN));
    if (o.level < LEVEL_LIST) {
      return code;
    } else {
      return "(" + code + ")";
    }
  };
  return Import;
}(Node));
exports.Of = Of = (function(superclass){
  Of.displayName = 'Of';
  var prototype = extend$(Of, superclass).prototype, constructor = Of;
  importAll$(prototype, arguments[1]);
  function Of(item, array){
    this.item = item;
    this.array = array;
  }
  prototype.children = ['item', 'array'];
  prototype.compileNode = function(o){
    var array, items, code, ref$, sub, ref, cmp, cnj, i, len$, test;
    items = (array = this.array.expandSlice(o).unwrap()).items;
    if (!(array instanceof Arr) || items.length < 2) {
      return (this.negated ? '!' : '') + "" + util('of') + "(" + this.item.compile(o, LEVEL_LIST) + ", " + array.compile(o, LEVEL_LIST) + ")";
    }
    code = '';
    ref$ = this.item.cache(o, false, LEVEL_PAREN), sub = ref$[0], ref = ref$[1];
    ref$ = this.negated
      ? [' !== ', ' && ']
      : [' === ', ' || '], cmp = ref$[0], cnj = ref$[1];
    for (i = 0, len$ = items.length; i < len$; ++i) {
      test = items[i];
      code && (code += cnj);
      if (test instanceof Splat) {
        code += (ref$ = new Of(Var(ref), test.it), ref$.negated = this.negated, ref$).compile(o, LEVEL_TOP);
        if (!(i || sub === ref)) {
          code = "(" + sub + ", " + code + ")";
        }
      } else {
        code += (i || sub === ref
          ? ref
          : "(" + sub + ")") + cmp + test.compile(o, LEVEL_OP + PREC['==']);
      }
    }
    sub === ref || o.scope.free(ref);
    if (o.level < LEVEL_OP + PREC['||']) {
      return code;
    } else {
      return "(" + code + ")";
    }
  };
  return Of;
}(Node, Negatable));
exports.Existence = Existence = (function(superclass){
  Existence.displayName = 'Existence';
  var prototype = extend$(Existence, superclass).prototype, constructor = Existence;
  importAll$(prototype, arguments[1]);
  function Existence(it, negated){
    var this$ = this instanceof ctor$ ? this : new ctor$;
    this$.it = it;
    this$.negated = negated;
    return this$;
  } function ctor$(){} ctor$.prototype = prototype;
  prototype.children = ['it'];
  prototype.compileNode = function(o){
    var node, ref$, code, op, eq;
    node = (ref$ = this.it.unwrap(), ref$.front = this.front, ref$);
    code = node.compile(o, LEVEL_OP + PREC['==']);
    if (node instanceof Var && !o.scope.check(code, true)) {
      ref$ = this.negated
        ? ['||', '=']
        : ['&&', '!'], op = ref$[0], eq = ref$[1];
      code = "typeof " + code + " " + eq + "= 'undefined' " + op + " " + code + " " + eq + "== null";
    } else {
      code += " " + (op = this.negated ? '==' : '!=') + " null";
    }
    if (o.level < LEVEL_OP + PREC[op]) {
      return code;
    } else {
      return "(" + code + ")";
    }
  };
  return Existence;
}(Node, Negatable));
exports.Fun = Fun = (function(superclass){
  Fun.displayName = 'Fun';
  var prototype = extend$(Fun, superclass).prototype, constructor = Fun;
  function Fun(params, body, bound){
    var this$ = this instanceof ctor$ ? this : new ctor$;
    this$.params = params || [];
    this$.body = body || Block();
    this$.bound = bound && 'this$';
    return this$;
  } function ctor$(){} ctor$.prototype = prototype;
  prototype.children = ['params', 'body'];
  prototype.show = function(){
    var that;
    return [this.name] + [(that = this.bound) ? "~" + that : void 8];
  };
  prototype.named = function(it){
    return this.name = it, this.statement = true, this;
  };
  prototype.isCallable = YES;
  prototype.isStatement = function(){
    return !!this.statement;
  };
  prototype.traverseChildren = function(arg$, xscope){
    if (xscope) {
      return superclass.prototype.traverseChildren.apply(this, arguments);
    }
  };
  prototype.makeReturn = function(){
    if (this.statement) {
      return this.returns = true, this;
    } else {
      return superclass.prototype.makeReturn.apply(this, arguments);
    }
  };
  prototype.ripName = function(it){
    this.name || (this.name = it.varName());
  };
  prototype.compileNode = function(o){
    var pscope, sscope, scope, that, loop, body, name, tab, code, ref$;
    pscope = o.scope;
    sscope = pscope.shared || pscope;
    scope = o.scope = this.body.scope = new Scope(this.wrapper ? pscope : sscope, this.wrapper && sscope);
    scope.fun = this;
    if (that = this.proto) {
      scope.assign('prototype', that.compile(o) + ".prototype");
    }
    if (that = this.cname) {
      scope.assign('constructor', that);
    }
    if (loop = o.loop, delete o.loop, loop) {
      o.indent = this.tab = '';
    }
    o.indent += TAB;
    body = this.body, name = this.name, tab = this.tab;
    code = 'function';
    if (this.bound === 'this$') {
      if (this.ctor) {
        scope.assign('this$', 'this instanceof ctor$ ? this : new ctor$');
        body.add(Return(Literal('this$')));
      } else if (that = (ref$ = sscope.fun) != null ? ref$.bound : void 8) {
        this.bound = that;
      } else {
        sscope.assign('this$', 'this');
      }
    }
    if (this.statement) {
      name || this.carp('nameless function declaration');
      pscope === o.block.scope || this.carp('misplaced function declaration');
      this.accessor && this.carp('named accessor');
      pscope.add(name, 'function', this);
    }
    if (this.statement || name && this.labeled) {
      code += ' ' + scope.add(name, 'function', this);
    }
    this['void'] || this.ctor || this.newed || body.makeReturn();
    code += "(" + this.compileParams(scope) + "){";
    if (that = body.compileWithDeclarations(o)) {
      code += "\n" + that + "\n" + tab;
    }
    code += '}';
    if (loop) {
      return pscope.assign(pscope.temporary('fn'), code);
    }
    if (this.returns) {
      code += "\n" + tab + "return " + name + ";";
    } else if (this.bound && this.ctor) {
      code += ' function ctor$(){} ctor$.prototype = prototype;';
    }
    if (this.front && !this.statement) {
      return "(" + code + ")";
    } else {
      return code;
    }
  };
  prototype.compileParams = function(scope){
    var params, body, names, assigns, i, len$, p, splace, rest, that, i$, vr, df, v, ref$, ref1$, name;
    params = this.params, body = this.body;
    names = [];
    assigns = [];
    for (i = 0, len$ = params.length; i < len$; ++i) {
      p = params[i];
      if (p instanceof Splat) {
        splace = i;
      } else if (p.op === '=' && !p.logic) {
        params[i] = Binary('?', p.left, p.right);
      }
    }
    if (splace != null) {
      rest = params.splice(splace, 9e9);
      if (!rest[1] && rest[0].it.isEmpty()) {
        rest = 0;
      }
    } else if (this.accessor) {
      if (that = params[1]) {
        that.carp('excess accessor parameter');
      }
    } else if (!(params.length || this.wrapper)) {
      if (body.traverseChildren(function(it){
        return it.value === 'it' || null;
      })) {
        params[0] = Var('it');
      }
    }
    if (params.length) {
      for (i$ = 0, len$ = params.length; i$ < len$; ++i$) {
        p = params[i$];
        vr = p;
        if (df = vr.getDefault()) {
          vr = vr.first;
        }
        if (vr.isEmpty()) {
          vr = Var(scope.temporary('arg'));
        } else if (!(vr instanceof Var)) {
          v = Var((ref1$ = (ref$ = vr.it || vr).name, delete ref$.name, ref1$) || vr.varName() || scope.temporary('arg'));
          assigns.push(Assign(vr, df ? Binary(p.op, v, p.second) : v));
          vr = v;
        } else if (df) {
          assigns.push(Assign(vr, p.second, '=', p.op));
        }
        names.push(name = scope.add(vr.value, 'arg', p));
      }
    }
    if (rest) {
      while (splace--) {
        rest.unshift(Arr());
      }
      assigns.push(Assign(Arr(rest), Literal('arguments')));
    }
    if (assigns.length) {
      (ref$ = this.body).prepend.apply(ref$, assigns);
    }
    return names.join(', ');
  };
  return Fun;
}(Node));
exports.Class = Class = (function(superclass){
  Class.displayName = 'Class';
  var prototype = extend$(Class, superclass).prototype, constructor = Class;
  function Class(title, sup, mixins, body){
    this.title = title;
    this.sup = sup;
    this.mixins = mixins;
    this.fun = Fun([], body);
  }
  prototype.children = ['title', 'sup', 'mixins', 'fun'];
  prototype.isCallable = YES;
  prototype.ripName = function(it){
    this.name = it.varName();
  };
  prototype.compile = function(o, level){
    var fun, body, lines, title, decl, name, proto, i, len$, node, i$, ref$, len1$, prop, ref1$, j$, len2$, f, ctor, vname, args, that, imports, res$, clas;
    fun = this.fun, body = fun.body, lines = body.lines, title = this.title;
    decl = title != null ? title.varName() : void 8;
    name = decl || this.name;
    if (ID.test(name || '')) {
      fun.cname = name;
    } else {
      name = 'constructor';
    }
    proto = Var('prototype');
    for (i = 0, len$ = lines.length; i < len$; ++i) {
      node = lines[i];
      if (node instanceof Obj) {
        lines[i] = Import(proto, node);
        for (i$ = 0, len1$ = (ref$ = node.items).length; i$ < len1$; ++i$) {
          prop = ref$[i$];
          if ((ref1$ = prop.key) instanceof Key || ref1$ instanceof Literal) {
            if (prop.val instanceof Fun) {
              prop.val.meth = prop.key;
            } else if (prop.accessor) {
              for (j$ = 0, len2$ = (ref1$ = prop.val).length; j$ < len2$; ++j$) {
                f = ref1$[j$];
                f.meth = prop.key;
              }
            }
          }
        }
      } else if (node instanceof Fun && !node.statement) {
        ctor && node.carp('redundant constructor');
        ctor = node;
      }
    }
    ctor || (ctor = lines[lines.length] = Fun());
    ctor.name = name;
    ctor.ctor = true;
    ctor.statement = true;
    lines.push(vname = fun.proto = Var(fun.bound = name));
    args = [];
    if (that = this.sup) {
      args.push(that);
      fun.proto = Util.Extends(vname, (ref$ = fun.params)[ref$.length] = Var('superclass'));
    }
    if (that = this.mixins) {
      res$ = [];
      for (i$ = 0, len$ = that.length; i$ < len$; ++i$) {
        args[args.length] = that[i$];
        res$.push(Import(proto, JS("arguments[" + (args.length - 1) + "]"), true));
      }
      imports = res$;
      body.prepend.apply(body, imports);
    }
    fun.cname && body.prepend(Literal(name + ".displayName = '" + name + "'"));
    clas = Parens(Call.make(fun, args), true);
    if (decl && title.isComplex()) {
      clas = Assign(vname, clas);
    }
    if (title) {
      clas = Assign(title, clas);
    }
    return clas.compile(o, level);
  };
  return Class;
}(Node));
exports.Super = Super = (function(superclass){
  Super.displayName = 'Super';
  var prototype = extend$(Super, superclass).prototype, constructor = Super;
  prototype.isCallable = YES;
  prototype.compile = function(o){
    var scope, that;
    scope = o.scope;
    if (!this.sproto) {
      for (; that = !scope.get('superclass') && scope.fun; scope = scope.parent) {
        if (that = that.meth) {
          return 'superclass.prototype' + Index(that).compile(o);
        }
      }
    }
    return 'superclass';
  };
  function Super(){}
  return Super;
}(Node));
exports.Parens = Parens = (function(superclass){
  Parens.displayName = 'Parens';
  var prototype = extend$(Parens, superclass).prototype, constructor = Parens;
  function Parens(it, keep, string){
    var this$ = this instanceof ctor$ ? this : new ctor$;
    this$.it = it;
    this$.keep = keep;
    this$.string = string;
    return this$;
  } function ctor$(){} ctor$.prototype = prototype;
  prototype.children = ['it'];
  prototype.show = function(){
    return this.string && '""';
  };
  prototype.delegate(['isComplex', 'isCallable', 'isArray', 'isRegex'], function(it){
    return this.it[it]();
  });
  prototype.isString = function(){
    return this.string || this.it.isString();
  };
  prototype.unparen = function(){
    if (this.keep) {
      return this;
    } else {
      return this.it.unparen();
    }
  };
  prototype.compile = function(o, level){
    var it;
    level == null && (level = o.level);
    it = this.it;
    it.cond || (it.cond = this.cond), it['void'] || (it['void'] = this['void']);
    if (this.calling && (!level || this['void'])) {
      it.head['void'] = true;
    }
    if (!(this.keep || this.newed || level >= LEVEL_OP + PREC[it.op])) {
      return (it.front = this.front, it).compile(o, level || LEVEL_PAREN);
    }
    if (it.isStatement()) {
      return it.compileClosure(o);
    } else {
      return "(" + it.compile(o, LEVEL_PAREN) + ")";
    }
  };
  return Parens;
}(Node));
exports.Splat = Splat = (function(superclass){
  Splat.displayName = 'Splat';
  var ref$, prototype = extend$(Splat, superclass).prototype, constructor = Splat;
  function Splat(it, filler){
    var this$ = this instanceof ctor$ ? this : new ctor$;
    this$.it = it;
    this$.filler = filler;
    return this$;
  } function ctor$(){} ctor$.prototype = prototype;
  ref$ = Parens.prototype, prototype.children = ref$.children, prototype.isComplex = ref$.isComplex;
  prototype.isAssignable = YES;
  prototype.assigns = function(it){
    return this.it.assigns(it);
  };
  prototype.compile = function(){
    return this.carp('invalid splat');
  };
  Splat.compileArray = function(o, list, apply){
    var index, len$, node, args, atoms, i$, ref$;
    expand(list);
    for (index = 0, len$ = list.length; index < len$; ++index) {
      node = list[index];
      if (node instanceof Splat) {
        break;
      }
    }
    if (index >= list.length) {
      return '';
    }
    if (!list[1]) {
      return (apply ? Object : ensureArray)(list[0].it).compile(o, LEVEL_LIST);
    }
    args = [];
    atoms = [];
    for (i$ = 0, len$ = (ref$ = list.splice(index, 9e9)).length; i$ < len$; ++i$) {
      node = ref$[i$];
      if (node instanceof Splat) {
        if (atoms.length) {
          args.push(Arr(atoms.splice(0, 9e9)));
        }
        args.push(ensureArray(node.it));
      } else {
        atoms.push(node);
      }
    }
    if (atoms.length) {
      args.push(Arr(atoms));
    }
    return (index
      ? Arr(list)
      : args.shift()).compile(o, LEVEL_CALL) + (".concat(" + List.compile(o, args) + ")");
  };
  function expand(nodes){
    var index, node, it;
    index = -1;
    while (node = nodes[++index]) {
      if (node instanceof Splat) {
        it = node.it;
        if (it.isEmpty()) {
          nodes.splice(index--, 1);
        } else if (it instanceof Arr) {
          nodes.splice.apply(nodes, [index, 1].concat(slice$.call(expand(it.items))));
          index += it.items.length - 1;
        }
      }
    }
    return nodes;
  }
  function ensureArray(node){
    if (node.isArray()) {
      return node;
    }
    return Call.make(JS(util('slice') + '.call'), [node]);
  }
  return Splat;
}(Node));
exports.Jump = Jump = (function(superclass){
  Jump.displayName = 'Jump';
  var prototype = extend$(Jump, superclass).prototype, constructor = Jump;
  function Jump(verb, label){
    this.verb = verb;
    this.label = label;
  }
  prototype.show = function(){
    var that;
    return (this.verb || '') + ((that = this.label) ? ' ' + that : '');
  };
  prototype.isStatement = YES;
  prototype.makeReturn = THIS;
  prototype.getJump = function(ctx){
    var that;
    ctx || (ctx = {});
    if (!ctx[this.verb]) {
      return this;
    }
    if (that = this.label) {
      return !of$(that, ctx.labels || (ctx.labels = [])) && this;
    }
  };
  prototype.compileNode = function(o){
    var that;
    if (that = this.label) {
      of$(that, o.labels || (o.labels = [])) || this.carp("unknown label \"" + that + "\"");
    } else {
      o[this.verb] || this.carp("stray " + this.verb);
    }
    return this.show() + ';';
  };
  Jump.extended = function(sub){
    sub.prototype.children = ['it'];
    this[sub.displayName.toLowerCase()] = sub;
  };
  return Jump;
}(Node));
exports.Throw = Throw = (function(superclass){
  Throw.displayName = 'Throw';
  var prototype = extend$(Throw, superclass).prototype, constructor = Throw;
  function Throw(it){
    var this$ = this instanceof ctor$ ? this : new ctor$;
    this$.it = it;
    return this$;
  } function ctor$(){} ctor$.prototype = prototype;
  prototype.getJump = VOID;
  prototype.compileNode = function(o){
    var ref$;
    return "throw " + (((ref$ = this.it) != null ? ref$.compile(o, LEVEL_PAREN) : void 8) || 'null') + ";";
  };
  return Throw;
}(Jump));
exports.Return = Return = (function(superclass){
  Return.displayName = 'Return';
  var prototype = extend$(Return, superclass).prototype, constructor = Return;
  function Return(it){
    var this$ = this instanceof ctor$ ? this : new ctor$;
    if (it && it.value !== 'void') {
      this$.it = it;
    }
    return this$;
  } function ctor$(){} ctor$.prototype = prototype;
  prototype.getJump = THIS;
  prototype.compileNode = function(o){
    var that;
    return "return" + ((that = this.it) ? ' ' + that.compile(o, LEVEL_PAREN) : '') + ";";
  };
  return Return;
}(Jump));
exports.While = While = (function(superclass){
  While.displayName = 'While';
  var prototype = extend$(While, superclass).prototype, constructor = While;
  function While(test, un, mode){
    this.un = un;
    mode && (mode instanceof Node
      ? this.update = mode
      : this.post = true);
    if (this.post || test.value !== '' + !un) {
      this.test = test;
    }
  }
  prototype.children = ['test', 'body', 'update', 'else'];
  prototype.aSource = 'test';
  prototype.aTargets = ['body', 'update'];
  prototype.show = function(){
    return [this.un ? '!' : void 8, this.post ? 'do' : void 8].join('');
  };
  prototype.isStatement = prototype.isArray = YES;
  prototype.getJump = function(ctx){
    var i$, ref$, len$, node;
    ctx || (ctx = {});
    ctx['continue'] = true;
    ctx['break'] = true;
    for (i$ = 0, len$ = (ref$ = this.body.lines).length; i$ < len$; ++i$) {
      node = ref$[i$];
      if (node.getJump(ctx)) {
        return node;
      }
    }
  };
  prototype.addBody = function(body){
    var top;
    this.body = body;
    top = body.lines[0];
    if ((top != null ? top.verb : void 8) === 'continue' && !top.label) {
      body.lines.length = 0;
    }
    return this;
  };
  prototype.makeReturn = function(it){
    var ref$;
    if (it) {
      this.body.makeReturn(it);
      if ((ref$ = this['else']) != null) {
        ref$.makeReturn(it);
      }
    } else {
      this.getJump() || (this.returns = true);
    }
    return this;
  };
  prototype.compileNode = function(o){
    var test, ref$, head, that;
    o.loop = true;
    this.test && (this.un
      ? this.test = this.test.invert()
      : this.anaphorize());
    if (this.post) {
      return 'do {' + this.compileBody((o.indent += TAB, o));
    }
    test = ((ref$ = this.test) != null ? ref$.compile(o, LEVEL_PAREN) : void 8) || '';
    if (!(this.update || this['else'])) {
      head = test ? "while (" + test : 'for (;;';
    } else {
      head = 'for (';
      if (this['else']) {
        head += (this.yet = o.scope.temporary('yet')) + " = true";
      }
      head += ";" + (test && ' ' + test) + ";";
      if (that = this.update) {
        head += ' ' + that.compile(o, LEVEL_PAREN);
      }
    }
    return head + ') {' + this.compileBody((o.indent += TAB, o));
  };
  prototype.compileBody = function(o){
    var lines, yet, tab, code, ret, key$, res, ref$, that;
    o['break'] = o['continue'] = true;
    lines = this.body.lines, yet = this.yet, tab = this.tab;
    code = ret = '';
    if (this.returns) {
      if (lines[key$ = lines.length - 1] != null) {
        lines[key$] = lines[key$].makeReturn(res = o.scope.assign('results$', '[]'));
      }
      ret = "\n" + tab + "return " + (res || '[]') + ";";
      if ((ref$ = this['else']) != null) {
        ref$.makeReturn();
      }
    }
    yet && lines.unshift(JS(yet + " = false;"));
    if (that = this.body.compile(o, LEVEL_TOP)) {
      code += "\n" + that + "\n" + tab;
    }
    code += '}';
    if (this.post) {
      code += " while (" + this.test.compile((o.tab = tab, o), LEVEL_PAREN) + ");";
    }
    if (yet) {
      code += " if (" + yet + ") " + this.compileBlock(o, Block(this['else']));
      o.scope.free(yet);
    }
    return code + ret;
  };
  return While;
}(Node));
exports.For = For = (function(superclass){
  For.displayName = 'For';
  var prototype = extend$(For, superclass).prototype, constructor = For;
  function For(it){
    importAll$(this, it);
    if (this.item instanceof Var && !this.item.value) {
      this.item = null;
    }
  }
  prototype.children = ['item', 'source', 'from', 'to', 'step', 'body'];
  prototype.aSource = null;
  prototype.show = function(){
    return this.index;
  };
  prototype.compileNode = function(o){
    var temps, idx, ref$, pvar, step, tvar, tail, fvar, vars, eq, cond, svar, srcPart, lvar, head, that, body;
    o.loop = true;
    temps = this.temps = [];
    if (idx = this.index) {
      o.scope.declare(idx, this);
    } else {
      temps.push(idx = o.scope.temporary('i'));
    }
    if (!this.object) {
      ref$ = (this.step || Literal(1)).compileLoopReference(o, 'step'), pvar = ref$[0], step = ref$[1];
      pvar === step || temps.push(pvar);
    }
    if (this.from) {
      ref$ = this.to.compileLoopReference(o, 'to'), tvar = ref$[0], tail = ref$[1];
      fvar = this.from.compile(o, LEVEL_LIST);
      vars = idx + " = " + fvar;
      if (tail !== tvar) {
        vars += ", " + tail;
        temps.push(tvar);
      }
      if (!this.step && +fvar > +tvar) {
        pvar = step = -1;
      }
      eq = this.op === 'til' ? '' : '=';
      cond = +pvar
        ? idx + " " + '<>'.charAt(pvar < 0) + eq + " " + tvar
        : pvar + " < 0 ? " + idx + " >" + eq + " " + tvar + " : " + idx + " <" + eq + " " + tvar;
    } else {
      if (this.item || this.object && this.own) {
        ref$ = this.source.compileLoopReference(o, 'ref', !this.object), svar = ref$[0], srcPart = ref$[1];
        svar === srcPart || temps.push(svar);
      } else {
        svar = srcPart = this.source.compile(o, LEVEL_PAREN);
      }
      if (!this.object) {
        if (0 > pvar && ~~pvar === +pvar) {
          vars = idx + " = " + srcPart + ".length - 1";
          cond = idx + " >= 0";
        } else {
          temps.push(lvar = o.scope.temporary('len'));
          vars = idx + " = 0, " + lvar + " = " + srcPart + ".length";
          cond = idx + " < " + lvar;
        }
      }
    }
    this['else'] && (this.yet = o.scope.temporary('yet'));
    head = 'for (';
    if (this.object) {
      head += idx + " in ";
    }
    if (that = this.yet) {
      head += that + " = true, ";
    }
    if (this.object) {
      head += srcPart;
    } else {
      step === pvar || (vars += ', ' + step);
      head += (vars + "; " + cond + "; ") + (1 == Math.abs(pvar)
        ? (pvar < 0 ? '--' : '++') + idx
        : idx + (pvar < 0
          ? ' -= ' + pvar.slice(1)
          : ' += ' + pvar));
    }
    this.own && (head += ") if (" + o.scope.assign('own$', '{}.hasOwnProperty') + ".call(" + svar + ", " + idx + ")");
    head += ') {';
    this.infuseIIFE();
    o.indent += TAB;
    if (this.item && !this.item.isEmpty()) {
      head += '\n' + o.indent + Assign(this.item, JS(svar + "[" + idx + "]")).compile(o, LEVEL_TOP) + ';';
    }
    body = this.compileBody(o);
    if (this.item && '}' === body.charAt(0)) {
      head += '\n' + this.tab;
    }
    return head + body;
  };
  prototype.infuseIIFE = function(){
    var this$ = this;
    function dup(params, name){
      var i$, len$, p;
      if (name) {
        for (i$ = 0, len$ = params.length; i$ < len$; ++i$) {
          p = params[i$];
          if (name === p.value) {
            return true;
          }
        }
      }
    }
    this.body.traverseChildren(function(it){
      var fun, params, call, index, item, that;
      if (!(it.calling || it.op === 'new' && (fun = it.it).params)) {
        return;
      }
      if (fun) {
        it.it = Call.make((fun['void'] = true, fun));
      } else {
        fun = it.it.head;
      }
      params = fun.params;
      call = it.it.tails[0];
      if (params.length ^ call.args.length - !!call.method) {
        return;
      }
      index = this$.index, item = this$.item;
      if (index && !dup(params, index)) {
        call.args.push(params[params.length] = Var(index));
      }
      if (that = item instanceof List && item.name) {
        item = Var(that);
      }
      if (item instanceof Var && !dup(params, item.value)) {
        call.args.push(params[params.length] = item);
      }
    });
  };
  return For;
}(While));
exports.Try = Try = (function(superclass){
  Try.displayName = 'Try';
  var prototype = extend$(Try, superclass).prototype, constructor = Try;
  function Try(attempt, thrown, recovery, ensure){
    this.attempt = attempt;
    this.thrown = thrown;
    this.recovery = recovery;
    this.ensure = ensure;
    if (recovery != null) {
      recovery.lines.unshift(Assign(Var(this.thrown || 'e'), Var('e$')));
    }
  }
  prototype.children = ['attempt', 'recovery', 'ensure'];
  prototype.show = function(){
    return this.thrown;
  };
  prototype.isStatement = YES;
  prototype.isCallable = function(){
    var ref$;
    return ((ref$ = this.recovery) != null ? ref$.isCallable() : void 8) && this.attempt.isCallable();
  };
  prototype.getJump = function(it){
    var ref$;
    return this.attempt.getJump(it) || ((ref$ = this.recovery) != null ? ref$.getJump(it) : void 8);
  };
  prototype.makeReturn = function(it){
    this.attempt = this.attempt.makeReturn(it);
    if (this.recovery != null) {
      this.recovery = this.recovery.makeReturn(it);
    }
    return this;
  };
  prototype.compileNode = function(o){
    var code, that;
    o.indent += TAB;
    code = 'try ' + this.compileBlock(o, this.attempt);
    if (that = this.recovery || !this.ensure && JS('')) {
      code += ' catch (e$) ' + this.compileBlock(o, that);
    }
    if (that = this.ensure) {
      code += ' finally ' + this.compileBlock(o, that);
    }
    return code;
  };
  return Try;
}(Node));
exports.Switch = Switch = (function(superclass){
  Switch.displayName = 'Switch';
  var prototype = extend$(Switch, superclass).prototype, constructor = Switch;
  function Switch(topic, cases, $default){
    this.topic = topic;
    this.cases = cases;
    this['default'] = $default;
  }
  prototype.children = ['topic', 'cases', 'default'];
  prototype.aSource = 'topic';
  prototype.aTargets = ['cases'];
  prototype.isStatement = YES;
  prototype.isCallable = function(){
    var i$, ref$, len$, c;
    for (i$ = 0, len$ = (ref$ = this.cases).length; i$ < len$; ++i$) {
      c = ref$[i$];
      if (!c.isCallable()) {
        return false;
      }
    }
    return (ref$ = this['default']) != null ? ref$.isCallable() : void 8;
  };
  prototype.getJump = function(ctx){
    var i$, ref$, len$, c, that;
    ctx || (ctx = {});
    ctx['break'] = true;
    for (i$ = 0, len$ = (ref$ = this.cases).length; i$ < len$; ++i$) {
      c = ref$[i$];
      if (that = c.body.getJump(ctx)) {
        return that;
      }
    }
    return (ref$ = this['default']) != null ? ref$.getJump(ctx) : void 8;
  };
  prototype.makeReturn = function(it){
    var i$, ref$, len$, c;
    for (i$ = 0, len$ = (ref$ = this.cases).length; i$ < len$; ++i$) {
      c = ref$[i$];
      c.makeReturn(it);
    }
    if ((ref$ = this['default']) != null) {
      ref$.makeReturn(it);
    }
    return this;
  };
  prototype.compileNode = function(o){
    var tab, topic, code, stop, i, ref$, len$, c, that;
    tab = this.tab;
    topic = !!this.topic && this.anaphorize().compile(o, LEVEL_PAREN);
    code = "switch (" + topic + ") {\n";
    stop = this['default'] || this.cases.length - 1;
    o['break'] = true;
    for (i = 0, len$ = (ref$ = this.cases).length; i < len$; ++i) {
      c = ref$[i];
      code += c.compileCase(o, tab, i === stop, !topic);
    }
    if (this['default']) {
      o.indent = tab + TAB;
      if (that = this['default'].compile(o, LEVEL_TOP)) {
        code += tab + ("default:\n" + that + "\n");
      }
    }
    return code + tab + '}';
  };
  return Switch;
}(Node));
exports.Case = Case = (function(superclass){
  Case.displayName = 'Case';
  var prototype = extend$(Case, superclass).prototype, constructor = Case;
  function Case(tests, body){
    this.tests = tests;
    this.body = body;
  }
  prototype.children = ['tests', 'body'];
  prototype.isCallable = function(){
    return this.body.isCallable();
  };
  prototype.makeReturn = function(it){
    var ref$, ref1$;
    if (((ref$ = (ref1$ = this.body.lines)[ref1$.length - 1]) != null ? ref$.value : void 8) !== 'fallthrough') {
      this.body.makeReturn(it);
    }
    return this;
  };
  prototype.compileCase = function(o, tab, nobr, bool){
    var tests, res$, i$, ref$, len$, test, j$, ref1$, len1$, t, i, that, code, lines, last, ft;
    res$ = [];
    for (i$ = 0, len$ = (ref$ = this.tests).length; i$ < len$; ++i$) {
      test = ref$[i$];
      test = test.expandSlice(o).unwrap();
      if (test instanceof Arr) {
        for (j$ = 0, len1$ = (ref1$ = test.items).length; j$ < len1$; ++j$) {
          t = ref1$[j$];
          res$.push(t);
        }
      } else {
        res$.push(test);
      }
    }
    tests = res$;
    tests.length || tests.push(Literal('void'));
    if (bool) {
      t = tests[0];
      i = 0;
      while (that = tests[++i]) {
        t = Binary('||', t, that);
      }
      tests = [(this.t = t, this.aSource = 't', this.aTargets = ['body'], this).anaphorize().invert()];
    }
    code = '';
    for (i$ = 0, len$ = tests.length; i$ < len$; ++i$) {
      t = tests[i$];
      code += tab + ("case " + t.compile(o, LEVEL_PAREN) + ":\n");
    }
    lines = this.body.lines;
    last = lines[lines.length - 1];
    if (ft = (last != null ? last.value : void 8) === 'fallthrough') {
      lines[lines.length - 1] = JS('// fallthrough');
    }
    o.indent = tab += TAB;
    if (that = this.body.compile(o, LEVEL_TOP)) {
      code += that + '\n';
    }
    if (!(nobr || ft || last instanceof Jump)) {
      code += tab + 'break;\n';
    }
    return code;
  };
  return Case;
}(Node));
exports.If = If = (function(superclass){
  If.displayName = 'If';
  var prototype = extend$(If, superclass).prototype, constructor = If;
  function If($if, then, un){
    var this$ = this instanceof ctor$ ? this : new ctor$;
    this$['if'] = $if;
    this$.then = then;
    this$.un = un;
    return this$;
  } function ctor$(){} ctor$.prototype = prototype;
  prototype.children = ['if', 'then', 'else'];
  prototype.aSource = 'if';
  prototype.aTargets = ['then'];
  prototype.show = function(){
    return this.un && '!';
  };
  prototype.terminator = '';
  prototype.delegate(['isCallable', 'isArray', 'isString', 'isRegex'], function(it){
    var ref$;
    return ((ref$ = this['else']) != null ? ref$[it]() : void 8) && this.then[it]();
  });
  prototype.getJump = function(it){
    var ref$;
    return this.then.getJump(it) || ((ref$ = this['else']) != null ? ref$.getJump(it) : void 8);
  };
  prototype.makeReturn = function(it){
    this.then = this.then.makeReturn(it);
    if (this['else'] != null) {
      this['else'] = this['else'].makeReturn(it);
    }
    return this;
  };
  prototype.compileNode = function(o){
    if (this.un) {
      this['if'] = this['if'].invert();
    } else {
      this.soak || this.anaphorize();
    }
    if (o.level) {
      return this.compileExpression(o);
    } else {
      return this.compileStatement(o);
    }
  };
  prototype.compileStatement = function(o){
    var code, els;
    code = "if (" + this['if'].compile(o, LEVEL_PAREN) + ") ";
    o.indent += TAB;
    code += this.compileBlock(o, Block(this.then));
    if (!(els = this['else'])) {
      return code;
    }
    return code + ' else ' + (els instanceof constructor
      ? els.compile((o.indent = this.tab, o), LEVEL_TOP)
      : this.compileBlock(o, els));
  };
  prototype.compileExpression = function(o){
    var thn, els, code, pad;
    thn = this.then, els = this['else'] || Literal('void');
    this['void'] && (thn['void'] = els['void'] = true);
    if (!this['else'] && (this.cond || this['void'])) {
      return Parens(Binary('&&', this['if'], thn)).compile(o);
    }
    code = this['if'].compile(o, LEVEL_COND);
    pad = els.isComplex() ? '\n' + (o.indent += TAB) : ' ';
    code += pad + "? " + thn.compile(o, LEVEL_LIST) + "" + pad + ": " + els.compile(o, LEVEL_LIST);
    if (o.level < LEVEL_COND) {
      return code;
    } else {
      return "(" + code + ")";
    }
  };
  If.unfoldSoak = function(o, parent, name){
    var that;
    if (that = parent[name].unfoldSoak(o)) {
      parent[name] = that.then;
      return that.cond = parent.cond, that['void'] = parent['void'], that.then = Chain(parent), that;
    }
  };
  return If;
}(Node));
exports.Label = Label = (function(superclass){
  Label.displayName = 'Label';
  var ref$, prototype = extend$(Label, superclass).prototype, constructor = Label;
  function Label(label, it){
    var fun;
    this.label = label || '_';
    this.it = it;
    if (fun = (it instanceof Fun || it instanceof Class) && it || it.calling && it.it.head) {
      fun.name || (fun.name = this.label, fun.labeled = true);
      return it;
    }
  }
  ref$ = Parens.prototype, prototype.children = ref$.children, prototype.isCallable = ref$.isCallable, prototype.isArray = ref$.isArray;
  prototype.show = function(){
    return this.label;
  };
  prototype.isStatement = YES;
  prototype.getJump = function(ctx){
    ctx || (ctx = {});
    (ctx.labels || (ctx.labels = [])).push(this.label);
    return this.it.getJump((ctx['break'] = true, ctx));
  };
  prototype.makeReturn = function(it){
    this.it = this.it.makeReturn(it);
    return this;
  };
  prototype.compileNode = function(o){
    var label, it, labels;
    label = this.label, it = this.it;
    labels = o.labels = slice$.call(o.labels || []);
    if (of$(label, labels)) {
      this.carp("duplicate label \"" + label + "\"");
    }
    labels.push(label);
    it.isStatement() || (it = Block(it));
    return (label + ": ") + (it instanceof Block
      ? (o.indent += TAB, this.compileBlock(o, it))
      : it.compile(o));
  };
  return Label;
}(Node));
exports.Pipe = Pipe = (function(superclass){
  Pipe.displayName = 'Pipe';
  var prototype = extend$(Pipe, superclass).prototype, constructor = Pipe;
  function Pipe(left, right){
    var this$ = this instanceof ctor$ ? this : new ctor$;
    this$.left = left;
    this$.right = right;
    return this$;
  } function ctor$(){} ctor$.prototype = prototype;
  prototype.compileNode = function(o){
    var firstPipe, t, right, code, ref$;
    firstPipe = o.pipee == null;
    if (firstPipe) {
      o.pipee = o.scope.temporary('_');
    }
    t = o.pipee + ' = ' + this.left.compile(o, LEVEL_LIST);
    right = this.right.compile(o);
    code = o.level
      ? "(" + t + ", " + right + ")"
      : t + ";\n" + right;
    if (firstPipe) {
      o.scope.free((ref$ = o.pipee, delete o.pipee, ref$));
    }
    return code;
  };
  return Pipe;
}(Node));
exports.Cascade = Cascade = (function(superclass){
  Cascade.displayName = 'Cascade';
  var prototype = extend$(Cascade, superclass).prototype, constructor = Cascade;
  function Cascade(target, block){
    this.target = target;
    this.block = block;
  }
  prototype.children = ['target', 'block'];
  prototype.terminator = '';
  prototype.makeReturn = function(it){
    this.block.makeReturn(it);
    return this;
  };
  prototype.compileNode = function(o){
    var ref, t, b;
    this.temps = [ref = o.scope.temporary('x')];
    t = ref + ' = ' + this.target.compile(o, LEVEL_LIST);
    o.level && (o.level = LEVEL_PAREN);
    o.cascadee = new String(ref);
    b = this.block.compile(o);
    o.cascadee.referred || this.carp('unreferred cascadee');
    if (o.level) {
      return "(" + t + ", " + b + ")";
    } else {
      return t + ";\n" + b;
    }
  };
  return Cascade;
}(Node));
exports.JS = JS = (function(superclass){
  JS.displayName = 'JS';
  var prototype = extend$(JS, superclass).prototype, constructor = JS;
  function JS(code, literal, comment){
    var this$ = this instanceof ctor$ ? this : new ctor$;
    this$.code = code;
    this$.literal = literal;
    this$.comment = comment;
    return this$;
  } function ctor$(){} ctor$.prototype = prototype;
  prototype.show = function(){
    if (this.comment) {
      return this.code;
    } else {
      return "`" + this.code + "`";
    }
  };
  prototype.terminator = '';
  prototype.isAssignable = prototype.isCallable = function(){
    return !this.comment;
  };
  prototype.compile = function(it){
    if (this.literal) {
      return entab(this.code, it.indent);
    } else {
      return this.code;
    }
  };
  return JS;
}(Node));
exports.Util = Util = (function(superclass){
  Util.displayName = 'Util';
  var prototype = extend$(Util, superclass).prototype, constructor = Util;
  function Util(verb){
    var this$ = this instanceof ctor$ ? this : new ctor$;
    this$.verb = verb;
    return this$;
  } function ctor$(){} ctor$.prototype = prototype;
  prototype.show = Jump.prototype.show;
  prototype.isCallable = YES;
  prototype.compile = function(){
    return util(this.verb);
  };
  Util.Extends = function(){
    return Call.make(Util('extend'), [arguments[0], arguments[1]]);
  };
  return Util;
}(Node));
exports.Vars = Vars = (function(superclass){
  Vars.displayName = 'Vars';
  var prototype = extend$(Vars, superclass).prototype, constructor = Vars;
  function Vars(vars){
    var this$ = this instanceof ctor$ ? this : new ctor$;
    this$.vars = vars;
    return this$;
  } function ctor$(){} ctor$.prototype = prototype;
  prototype.children = ['vars'];
  prototype.makeReturn = THIS;
  prototype.compile = function(o, level){
    var i$, ref$, len$, v, value;
    for (i$ = 0, len$ = (ref$ = this.vars).length; i$ < len$; ++i$) {
      v = ref$[i$], value = v.value;
      if (!(v instanceof Var)) {
        v.carp('invalid variable declaration');
      }
      if (o.scope.check(value)) {
        v.carp("redeclaration of \"" + value + "\"");
      }
      o.scope.declare(value, v);
    }
    return Literal('void').compile(o, level);
  };
  return Vars;
}(Node));
exports.L = function(yylineno, node){
  return node.line = yylineno + 1, node;
};
exports.Decl = function(type, nodes, lno){
  if (!nodes[0]) {
    throw SyntaxError("empty " + type + " on line " + lno);
  }
  return DECLS[type](nodes);
};
DECLS = {
  'export': function(lines){
    var i, out, node, that, ref$;
    i = -1;
    out = Util('out');
    while (node = lines[++i]) {
      if (node instanceof Block) {
        lines.splice.apply(lines, [i--, 1].concat(slice$.call(node.lines)));
        continue;
      }
      if (that = node instanceof Fun && node.name) {
        lines.splice(i++, 0, Assign(Chain(out, [Index(Key(that))]), Var(that)));
        continue;
      }
      lines[i] = (that = node.varName() || node instanceof Assign && node.left.varName() || node instanceof Class && ((ref$ = node.title) != null ? ref$.varName() : void 8))
        ? Assign(Chain(out, [Index(Key(that))]), node)
        : Import(out, node);
    }
    return Block(lines);
  },
  'import': function(lines, all){
    var i, len$, line;
    for (i = 0, len$ = lines.length; i < len$; ++i) {
      line = lines[i];
      lines[i] = Import(Literal('this'), line, all);
    }
    return Block(lines);
  },
  importAll: function(it){
    return this['import'](it, true);
  },
  'const': function(lines){
    var i$, len$, node;
    for (i$ = 0, len$ = lines.length; i$ < len$; ++i$) {
      node = lines[i$];
      node.op === '=' || node.carp('invalid constant variable declaration');
      node['const'] = true;
    }
    return Block(lines);
  },
  'var': Vars
};
function Scope(parent, shared){
  this.parent = parent;
  this.shared = shared;
  this.variables = {};
}
ref$ = Scope.prototype;
ref$.READ_ONLY = {
  'const': 'constant',
  'function': 'function',
  undefined: 'undeclared'
};
ref$.add = function(name, type, node){
  var t, that;
  if (node && (t = this.variables[name + "."])) {
    if (that = this.READ_ONLY[t] || this.READ_ONLY[type]) {
      node.carp("redeclaration of " + that + " \"" + name + "\"");
    } else if (t === type && type === 'arg') {
      node.carp("duplicate parameter \"" + name + "\"");
    } else if (t === 'upvar') {
      node.carp("accidental shadow of \"" + name + "\"");
    }
    if (t === 'arg' || t === 'function') {
      return name;
    }
  }
  this.variables[name + "."] = type;
  return name;
};
ref$.get = function(name){
  return this.variables[name + "."];
};
ref$.declare = function(name, node, constant){
  var that, scope;
  if (that = this.shared) {
    if (this.check(name)) {
      return;
    }
    scope = that;
  } else {
    scope = this;
  }
  return scope.add(name, constant ? 'const' : 'var', node);
};
ref$.assign = function(name, value){
  return this.add(name, {
    value: value
  });
};
ref$.temporary = function(name){
  var ref$;
  name || (name = 'ref');
  while ((ref$ = this.variables[name + "$."]) !== 'reuse' && ref$ !== void 8) {
    name = name.length < 2 && name < 'z'
      ? String.fromCharCode(name.charCodeAt() + 1)
      : name.replace(/\d*$/, fn$);
  }
  return this.add(name + '$', 'var');
  function fn$(it){
    return ++it;
  }
};
ref$.free = function(name){
  return this.add(name, 'reuse');
};
ref$.check = function(name, above){
  var type, ref$;
  if ((type = this.variables[name + "."]) || !above) {
    return type;
  }
  return (ref$ = this.parent) != null ? ref$.check(name, above) : void 8;
};
ref$.checkReadOnly = function(name){
  var that, ref$, key$;
  if (that = this.READ_ONLY[this.check(name, true)]) {
    return that;
  }
  (ref$ = this.variables)[key$ = name + "."] || (ref$[key$] = 'upvar');
  return '';
};
ref$.emit = function(code, tab){
  var vrs, asn, fun, name, ref$, type, that, val;
  vrs = [];
  asn = [];
  fun = [];
  for (name in ref$ = this.variables) {
    type = ref$[name];
    name = name.slice(0, -1);
    if (type === 'var' || type === 'const' || type === 'reuse') {
      vrs.push(name);
    } else if (that = type.value) {
      if (~(val = entab(that, tab)).lastIndexOf('function(', 0)) {
        fun.push("function " + name + val.slice(8));
      } else {
        asn.push(name + " = " + val);
      }
    }
  }
  if (that = vrs.concat(asn).join(', ')) {
    code = tab + "var " + that + ";\n" + code;
  }
  if (that = fun.join("\n" + tab)) {
    return code + "\n" + tab + that;
  } else {
    return code;
  }
};
function YES(){
  return true;
}
function NO(){
  return false;
}
function THIS(){
  return this;
}
function VOID(){}
UTILS = {
  clone: 'function(it){\n  function fun(){} fun.prototype = it;\n  return new fun;\n}',
  extend: 'function(sub, sup){\n  function fun(){} fun.prototype = (sub.superclass = sup).prototype;\n  (sub.prototype = new fun).constructor = sub;\n  if (typeof sup.extended == \'function\') sup.extended(sub);\n  return sub;\n}',
  bind: 'function(obj, key){\n  return function(){ return obj[key].apply(obj, arguments) };\n}',
  'import': 'function(obj, src){\n  var own = {}.hasOwnProperty;\n  for (var key in src) if (own.call(src, key)) obj[key] = src[key];\n  return obj;\n}',
  importAll: 'function(obj, src){\n  for (var key in src) obj[key] = src[key];\n  return obj;\n}',
  repeatString: 'function(str, n){\n  for (var r = \'\'; n > 0; (n >>= 1) && (str += str)) if (n & 1) r += str;\n  return r;\n}',
  repeatArray: 'function(arr, n){\n  for (var r = []; n > 0; (n >>= 1) && (arr = arr.concat(arr)))\n    if (n & 1) r.push.apply(r, arr);\n  return r;\n}',
  of: 'function(x, arr){\n  var i = 0, l = arr.length >>> 0;\n  while (i < l) if (x === arr[i++]) return true;\n  return false;\n}',
  out: 'typeof exports != \'undefined\' && exports || this',
  split: "''.split",
  replace: "''.replace",
  toString: '{}.toString',
  join: '[].join',
  slice: '[].slice'
};
LEVEL_TOP = 0;
LEVEL_PAREN = 1;
LEVEL_LIST = 2;
LEVEL_COND = 3;
LEVEL_OP = 4;
LEVEL_CALL = 5;
(function(){
  this['&&'] = this['||'] = 0.2;
  this['&'] = this['^'] = this['|'] = 0.3;
  this['=='] = this['!='] = this['==='] = this['!=='] = 0.4;
  this['<'] = this['>'] = this['<='] = this['>='] = this['in'] = this['instanceof'] = 0.5;
  this['<<'] = this['>>'] = this['>>>'] = 0.6;
  this['+'] = this['-'] = 0.7;
  this['*'] = this['/'] = this['%'] = 0.8;
}.call(PREC = {
  unary: 0.9
}));
TAB = '  ';
ID = /^(?!\d)[\w$\xAA-\uFFDC]+$/;
SIMPLENUM = /^\d+$/;
function util(it){
  return Scope.root.assign(it + '$', UTILS[it]);
}
function entab(code, tab){
  return code.replace(/\n/g, '\n' + tab);
}
function import$(obj, src){
  var own = {}.hasOwnProperty;
  for (var key in src) if (own.call(src, key)) obj[key] = src[key];
  return obj;
}
function clone$(it){
  function fun(){} fun.prototype = it;
  return new fun;
}
function extend$(sub, sup){
  function fun(){} fun.prototype = (sub.superclass = sup).prototype;
  (sub.prototype = new fun).constructor = sub;
  if (typeof sup.extended == 'function') sup.extended(sub);
  return sub;
}
function repeatString$(str, n){
  for (var r = ''; n > 0; (n >>= 1) && (str += str)) if (n & 1) r += str;
  return r;
}
function importAll$(obj, src){
  for (var key in src) obj[key] = src[key];
  return obj;
}
function of$(x, arr){
  var i = 0, l = arr.length >>> 0;
  while (i < l) if (x === arr[i++]) return true;
  return false;
}