
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    const identity = x => x;
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function exclude_internal_props(props) {
        const result = {};
        for (const k in props)
            if (k[0] !== '$')
                result[k] = props[k];
        return result;
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf(run_tasks);
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop(callback) {
        let task;
        if (tasks.size === 0)
            raf(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
            }),
            abort() {
                tasks.delete(task);
            }
        };
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function prevent_default(fn) {
        return function (event) {
            event.preventDefault();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function set_attributes(node, attributes) {
        // @ts-ignore
        const descriptors = Object.getOwnPropertyDescriptors(node.__proto__);
        for (const key in attributes) {
            if (attributes[key] == null) {
                node.removeAttribute(key);
            }
            else if (key === 'style') {
                node.style.cssText = attributes[key];
            }
            else if (key === '__value' || descriptors[key] && descriptors[key].set) {
                node[key] = attributes[key];
            }
            else {
                attr(node, key, attributes[key]);
            }
        }
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    const active_docs = new Set();
    let active = 0;
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
        const step = 16.666 / duration;
        let keyframes = '{\n';
        for (let p = 0; p <= 1; p += step) {
            const t = a + (b - a) * ease(p);
            keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
        }
        const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
        const name = `__svelte_${hash(rule)}_${uid}`;
        const doc = node.ownerDocument;
        active_docs.add(doc);
        const stylesheet = doc.__svelte_stylesheet || (doc.__svelte_stylesheet = doc.head.appendChild(element('style')).sheet);
        const current_rules = doc.__svelte_rules || (doc.__svelte_rules = {});
        if (!current_rules[name]) {
            current_rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ``}${name} ${duration}ms linear ${delay}ms 1 both`;
        active += 1;
        return name;
    }
    function delete_rule(node, name) {
        const previous = (node.style.animation || '').split(', ');
        const next = previous.filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        );
        const deleted = previous.length - next.length;
        if (deleted) {
            node.style.animation = next.join(', ');
            active -= deleted;
            if (!active)
                clear_rules();
        }
    }
    function clear_rules() {
        raf(() => {
            if (active)
                return;
            active_docs.forEach(doc => {
                const stylesheet = doc.__svelte_stylesheet;
                let i = stylesheet.cssRules.length;
                while (i--)
                    stylesheet.deleteRule(i);
                doc.__svelte_rules = {};
            });
            active_docs.clear();
        });
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error(`Function called outside component initialization`);
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function onDestroy(fn) {
        get_current_component().$$.on_destroy.push(fn);
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
    }
    function setContext(key, context) {
        get_current_component().$$.context.set(key, context);
    }
    function getContext(key) {
        return get_current_component().$$.context.get(key);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }

    let promise;
    function wait() {
        if (!promise) {
            promise = Promise.resolve();
            promise.then(() => {
                promise = null;
            });
        }
        return promise;
    }
    function dispatch(node, direction, kind) {
        node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    const null_transition = { duration: 0 };
    function create_in_transition(node, fn, params) {
        let config = fn(node, params);
        let running = false;
        let animation_name;
        let task;
        let uid = 0;
        function cleanup() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            if (css)
                animation_name = create_rule(node, 0, 1, duration, delay, easing, css, uid++);
            tick(0, 1);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            if (task)
                task.abort();
            running = true;
            add_render_callback(() => dispatch(node, true, 'start'));
            task = loop(now => {
                if (running) {
                    if (now >= end_time) {
                        tick(1, 0);
                        dispatch(node, true, 'end');
                        cleanup();
                        return running = false;
                    }
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(t, 1 - t);
                    }
                }
                return running;
            });
        }
        let started = false;
        return {
            start() {
                if (started)
                    return;
                delete_rule(node);
                if (is_function(config)) {
                    config = config();
                    wait().then(go);
                }
                else {
                    go();
                }
            },
            invalidate() {
                started = false;
            },
            end() {
                if (running) {
                    cleanup();
                    running = false;
                }
            }
        };
    }
    function create_out_transition(node, fn, params) {
        let config = fn(node, params);
        let running = true;
        let animation_name;
        const group = outros;
        group.r += 1;
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            if (css)
                animation_name = create_rule(node, 1, 0, duration, delay, easing, css);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            add_render_callback(() => dispatch(node, false, 'start'));
            loop(now => {
                if (running) {
                    if (now >= end_time) {
                        tick(0, 1);
                        dispatch(node, false, 'end');
                        if (!--group.r) {
                            // this will result in `end()` being called,
                            // so we don't need to clean up here
                            run_all(group.c);
                        }
                        return false;
                    }
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(1 - t, t);
                    }
                }
                return running;
            });
        }
        if (is_function(config)) {
            wait().then(() => {
                // @ts-ignore
                config = config();
                go();
            });
        }
        else {
            go();
        }
        return {
            end(reset) {
                if (reset && config.tick) {
                    config.tick(1, 0);
                }
                if (running) {
                    if (animation_name)
                        delete_rule(node, animation_name);
                    running = false;
                }
            }
        };
    }
    function create_bidirectional_transition(node, fn, params, intro) {
        let config = fn(node, params);
        let t = intro ? 0 : 1;
        let running_program = null;
        let pending_program = null;
        let animation_name = null;
        function clear_animation() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function init(program, duration) {
            const d = program.b - t;
            duration *= Math.abs(d);
            return {
                a: t,
                b: program.b,
                d,
                duration,
                start: program.start,
                end: program.start + duration,
                group: program.group
            };
        }
        function go(b) {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            const program = {
                start: now() + delay,
                b
            };
            if (!b) {
                // @ts-ignore todo: improve typings
                program.group = outros;
                outros.r += 1;
            }
            if (running_program) {
                pending_program = program;
            }
            else {
                // if this is an intro, and there's a delay, we need to do
                // an initial tick and/or apply CSS animation immediately
                if (css) {
                    clear_animation();
                    animation_name = create_rule(node, t, b, duration, delay, easing, css);
                }
                if (b)
                    tick(0, 1);
                running_program = init(program, duration);
                add_render_callback(() => dispatch(node, b, 'start'));
                loop(now => {
                    if (pending_program && now > pending_program.start) {
                        running_program = init(pending_program, duration);
                        pending_program = null;
                        dispatch(node, running_program.b, 'start');
                        if (css) {
                            clear_animation();
                            animation_name = create_rule(node, t, running_program.b, running_program.duration, 0, easing, config.css);
                        }
                    }
                    if (running_program) {
                        if (now >= running_program.end) {
                            tick(t = running_program.b, 1 - t);
                            dispatch(node, running_program.b, 'end');
                            if (!pending_program) {
                                // we're done
                                if (running_program.b) {
                                    // intro — we can tidy up immediately
                                    clear_animation();
                                }
                                else {
                                    // outro — needs to be coordinated
                                    if (!--running_program.group.r)
                                        run_all(running_program.group.c);
                                }
                            }
                            running_program = null;
                        }
                        else if (now >= running_program.start) {
                            const p = now - running_program.start;
                            t = running_program.a + running_program.d * easing(p / running_program.duration);
                            tick(t, 1 - t);
                        }
                    }
                    return !!(running_program || pending_program);
                });
            }
        }
        return {
            run(b) {
                if (is_function(config)) {
                    wait().then(() => {
                        // @ts-ignore
                        config = config();
                        go(b);
                    });
                }
                else {
                    go(b);
                }
            },
            end() {
                clear_animation();
                running_program = pending_program = null;
            }
        };
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }
    function get_spread_object(spread_props) {
        return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if ($$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set() {
            // overridden by instance, if it has props
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.22.2' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev("SvelteDOMInsert", { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev("SvelteDOMInsert", { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev("SvelteDOMRemove", { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ["capture"] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev("SvelteDOMAddEventListener", { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev("SvelteDOMRemoveEventListener", { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.data === data)
            return;
        dispatch_dev("SvelteDOMSetData", { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

    function unwrapExports (x) {
    	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
    }

    function createCommonjsModule(fn, module) {
    	return module = { exports: {} }, fn(module, module.exports), module.exports;
    }

    var aos = createCommonjsModule(function (module, exports) {
    !function(e,t){module.exports=t();}(commonjsGlobal,function(){var e="undefined"!=typeof window?window:"undefined"!=typeof commonjsGlobal?commonjsGlobal:"undefined"!=typeof self?self:{},t="Expected a function",n=NaN,o="[object Symbol]",i=/^\s+|\s+$/g,a=/^[-+]0x[0-9a-f]+$/i,r=/^0b[01]+$/i,c=/^0o[0-7]+$/i,s=parseInt,u="object"==typeof e&&e&&e.Object===Object&&e,d="object"==typeof self&&self&&self.Object===Object&&self,l=u||d||Function("return this")(),f=Object.prototype.toString,m=Math.max,p=Math.min,b=function(){return l.Date.now()};function v(e,n,o){var i,a,r,c,s,u,d=0,l=!1,f=!1,v=!0;if("function"!=typeof e)throw new TypeError(t);function y(t){var n=i,o=a;return i=a=void 0,d=t,c=e.apply(o,n)}function h(e){var t=e-u;return void 0===u||t>=n||t<0||f&&e-d>=r}function k(){var e=b();if(h(e))return x(e);s=setTimeout(k,function(e){var t=n-(e-u);return f?p(t,r-(e-d)):t}(e));}function x(e){return s=void 0,v&&i?y(e):(i=a=void 0,c)}function O(){var e=b(),t=h(e);if(i=arguments,a=this,u=e,t){if(void 0===s)return function(e){return d=e,s=setTimeout(k,n),l?y(e):c}(u);if(f)return s=setTimeout(k,n),y(u)}return void 0===s&&(s=setTimeout(k,n)),c}return n=w(n)||0,g(o)&&(l=!!o.leading,r=(f="maxWait"in o)?m(w(o.maxWait)||0,n):r,v="trailing"in o?!!o.trailing:v),O.cancel=function(){void 0!==s&&clearTimeout(s),d=0,i=u=a=s=void 0;},O.flush=function(){return void 0===s?c:x(b())},O}function g(e){var t=typeof e;return !!e&&("object"==t||"function"==t)}function w(e){if("number"==typeof e)return e;if(function(e){return "symbol"==typeof e||function(e){return !!e&&"object"==typeof e}(e)&&f.call(e)==o}(e))return n;if(g(e)){var t="function"==typeof e.valueOf?e.valueOf():e;e=g(t)?t+"":t;}if("string"!=typeof e)return 0===e?e:+e;e=e.replace(i,"");var u=r.test(e);return u||c.test(e)?s(e.slice(2),u?2:8):a.test(e)?n:+e}var y=function(e,n,o){var i=!0,a=!0;if("function"!=typeof e)throw new TypeError(t);return g(o)&&(i="leading"in o?!!o.leading:i,a="trailing"in o?!!o.trailing:a),v(e,n,{leading:i,maxWait:n,trailing:a})},h="Expected a function",k=NaN,x="[object Symbol]",O=/^\s+|\s+$/g,j=/^[-+]0x[0-9a-f]+$/i,E=/^0b[01]+$/i,N=/^0o[0-7]+$/i,z=parseInt,C="object"==typeof e&&e&&e.Object===Object&&e,A="object"==typeof self&&self&&self.Object===Object&&self,q=C||A||Function("return this")(),L=Object.prototype.toString,T=Math.max,M=Math.min,S=function(){return q.Date.now()};function D(e){var t=typeof e;return !!e&&("object"==t||"function"==t)}function H(e){if("number"==typeof e)return e;if(function(e){return "symbol"==typeof e||function(e){return !!e&&"object"==typeof e}(e)&&L.call(e)==x}(e))return k;if(D(e)){var t="function"==typeof e.valueOf?e.valueOf():e;e=D(t)?t+"":t;}if("string"!=typeof e)return 0===e?e:+e;e=e.replace(O,"");var n=E.test(e);return n||N.test(e)?z(e.slice(2),n?2:8):j.test(e)?k:+e}var $=function(e,t,n){var o,i,a,r,c,s,u=0,d=!1,l=!1,f=!0;if("function"!=typeof e)throw new TypeError(h);function m(t){var n=o,a=i;return o=i=void 0,u=t,r=e.apply(a,n)}function p(e){var n=e-s;return void 0===s||n>=t||n<0||l&&e-u>=a}function b(){var e=S();if(p(e))return v(e);c=setTimeout(b,function(e){var n=t-(e-s);return l?M(n,a-(e-u)):n}(e));}function v(e){return c=void 0,f&&o?m(e):(o=i=void 0,r)}function g(){var e=S(),n=p(e);if(o=arguments,i=this,s=e,n){if(void 0===c)return function(e){return u=e,c=setTimeout(b,t),d?m(e):r}(s);if(l)return c=setTimeout(b,t),m(s)}return void 0===c&&(c=setTimeout(b,t)),r}return t=H(t)||0,D(n)&&(d=!!n.leading,a=(l="maxWait"in n)?T(H(n.maxWait)||0,t):a,f="trailing"in n?!!n.trailing:f),g.cancel=function(){void 0!==c&&clearTimeout(c),u=0,o=s=i=c=void 0;},g.flush=function(){return void 0===c?r:v(S())},g},W=function(){};function P(e){e&&e.forEach(function(e){var t=Array.prototype.slice.call(e.addedNodes),n=Array.prototype.slice.call(e.removedNodes);if(function e(t){var n=void 0,o=void 0;for(n=0;n<t.length;n+=1){if((o=t[n]).dataset&&o.dataset.aos)return !0;if(o.children&&e(o.children))return !0}return !1}(t.concat(n)))return W()});}function Y(){return window.MutationObserver||window.WebKitMutationObserver||window.MozMutationObserver}var _={isSupported:function(){return !!Y()},ready:function(e,t){var n=window.document,o=new(Y())(P);W=t,o.observe(n.documentElement,{childList:!0,subtree:!0,removedNodes:!0});}},B=function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")},F=function(){function e(e,t){for(var n=0;n<t.length;n++){var o=t[n];o.enumerable=o.enumerable||!1,o.configurable=!0,"value"in o&&(o.writable=!0),Object.defineProperty(e,o.key,o);}}return function(t,n,o){return n&&e(t.prototype,n),o&&e(t,o),t}}(),I=Object.assign||function(e){for(var t=1;t<arguments.length;t++){var n=arguments[t];for(var o in n)Object.prototype.hasOwnProperty.call(n,o)&&(e[o]=n[o]);}return e},K=/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i,G=/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i,J=/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i,Q=/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i;function R(){return navigator.userAgent||navigator.vendor||window.opera||""}var U=new(function(){function e(){B(this,e);}return F(e,[{key:"phone",value:function(){var e=R();return !(!K.test(e)&&!G.test(e.substr(0,4)))}},{key:"mobile",value:function(){var e=R();return !(!J.test(e)&&!Q.test(e.substr(0,4)))}},{key:"tablet",value:function(){return this.mobile()&&!this.phone()}},{key:"ie11",value:function(){return "-ms-scroll-limit"in document.documentElement.style&&"-ms-ime-align"in document.documentElement.style}}]),e}()),V=function(e,t){var n=void 0;return U.ie11()?(n=document.createEvent("CustomEvent")).initCustomEvent(e,!0,!0,{detail:t}):n=new CustomEvent(e,{detail:t}),document.dispatchEvent(n)},X=function(e){return e.forEach(function(e,t){return function(e,t){var n=e.options,o=e.position,i=e.node,a=(e.data,function(){e.animated&&(function(e,t){t&&t.forEach(function(t){return e.classList.remove(t)});}(i,n.animatedClassNames),V("aos:out",i),e.options.id&&V("aos:in:"+e.options.id,i),e.animated=!1);});n.mirror&&t>=o.out&&!n.once?a():t>=o.in?e.animated||(function(e,t){t&&t.forEach(function(t){return e.classList.add(t)});}(i,n.animatedClassNames),V("aos:in",i),e.options.id&&V("aos:in:"+e.options.id,i),e.animated=!0):e.animated&&!n.once&&a();}(e,window.pageYOffset)})},Z=function(e){for(var t=0,n=0;e&&!isNaN(e.offsetLeft)&&!isNaN(e.offsetTop);)t+=e.offsetLeft-("BODY"!=e.tagName?e.scrollLeft:0),n+=e.offsetTop-("BODY"!=e.tagName?e.scrollTop:0),e=e.offsetParent;return {top:n,left:t}},ee=function(e,t,n){var o=e.getAttribute("data-aos-"+t);if(void 0!==o){if("true"===o)return !0;if("false"===o)return !1}return o||n},te=function(e,t){return e.forEach(function(e,n){var o=ee(e.node,"mirror",t.mirror),i=ee(e.node,"once",t.once),a=ee(e.node,"id"),r=t.useClassNames&&e.node.getAttribute("data-aos"),c=[t.animatedClassName].concat(r?r.split(" "):[]).filter(function(e){return "string"==typeof e});t.initClassName&&e.node.classList.add(t.initClassName),e.position={in:function(e,t,n){var o=window.innerHeight,i=ee(e,"anchor"),a=ee(e,"anchor-placement"),r=Number(ee(e,"offset",a?0:t)),c=a||n,s=e;i&&document.querySelectorAll(i)&&(s=document.querySelectorAll(i)[0]);var u=Z(s).top-o;switch(c){case"top-bottom":break;case"center-bottom":u+=s.offsetHeight/2;break;case"bottom-bottom":u+=s.offsetHeight;break;case"top-center":u+=o/2;break;case"center-center":u+=o/2+s.offsetHeight/2;break;case"bottom-center":u+=o/2+s.offsetHeight;break;case"top-top":u+=o;break;case"bottom-top":u+=o+s.offsetHeight;break;case"center-top":u+=o+s.offsetHeight/2;}return u+r}(e.node,t.offset,t.anchorPlacement),out:o&&function(e,t){var n=ee(e,"anchor"),o=ee(e,"offset",t),i=e;return n&&document.querySelectorAll(n)&&(i=document.querySelectorAll(n)[0]),Z(i).top+i.offsetHeight-o}(e.node,t.offset)},e.options={once:i,mirror:o,animatedClassNames:c,id:a};}),e},ne=function(){var e=document.querySelectorAll("[data-aos]");return Array.prototype.map.call(e,function(e){return {node:e}})},oe=[],ie=!1,ae={offset:120,delay:0,easing:"ease",duration:400,disable:!1,once:!1,mirror:!1,anchorPlacement:"top-bottom",startEvent:"DOMContentLoaded",animatedClassName:"aos-animate",initClassName:"aos-init",useClassNames:!1,disableMutationObserver:!1,throttleDelay:99,debounceDelay:50},re=function(){return document.all&&!window.atob},ce=function(){arguments.length>0&&void 0!==arguments[0]&&arguments[0]&&(ie=!0),ie&&(oe=te(oe,ae),X(oe),window.addEventListener("scroll",y(function(){X(oe,ae.once);},ae.throttleDelay)));},se=function(){if(oe=ne(),de(ae.disable)||re())return ue();ce();},ue=function(){oe.forEach(function(e,t){e.node.removeAttribute("data-aos"),e.node.removeAttribute("data-aos-easing"),e.node.removeAttribute("data-aos-duration"),e.node.removeAttribute("data-aos-delay"),ae.initClassName&&e.node.classList.remove(ae.initClassName),ae.animatedClassName&&e.node.classList.remove(ae.animatedClassName);});},de=function(e){return !0===e||"mobile"===e&&U.mobile()||"phone"===e&&U.phone()||"tablet"===e&&U.tablet()||"function"==typeof e&&!0===e()};return {init:function(e){return ae=I(ae,e),oe=ne(),ae.disableMutationObserver||_.isSupported()||(console.info('\n      aos: MutationObserver is not supported on this browser,\n      code mutations observing has been disabled.\n      You may have to call "refreshHard()" by yourself.\n    '),ae.disableMutationObserver=!0),ae.disableMutationObserver||_.ready("[data-aos]",se),de(ae.disable)||re()?ue():(document.querySelector("body").setAttribute("data-aos-easing",ae.easing),document.querySelector("body").setAttribute("data-aos-duration",ae.duration),document.querySelector("body").setAttribute("data-aos-delay",ae.delay),-1===["DOMContentLoaded","load"].indexOf(ae.startEvent)?document.addEventListener(ae.startEvent,function(){ce(!0);}):window.addEventListener("load",function(){ce(!0);}),"DOMContentLoaded"===ae.startEvent&&["complete","interactive"].indexOf(document.readyState)>-1&&ce(!0),window.addEventListener("resize",$(ce,ae.debounceDelay,!0)),window.addEventListener("orientationchange",$(ce,ae.debounceDelay,!0)),oe)},refresh:ce,refreshHard:se}});
    });

    var strictUriEncode = str => encodeURIComponent(str).replace(/[!'()*]/g, x => `%${x.charCodeAt(0).toString(16).toUpperCase()}`);

    var token = '%[a-f0-9]{2}';
    var singleMatcher = new RegExp(token, 'gi');
    var multiMatcher = new RegExp('(' + token + ')+', 'gi');

    function decodeComponents(components, split) {
    	try {
    		// Try to decode the entire string first
    		return decodeURIComponent(components.join(''));
    	} catch (err) {
    		// Do nothing
    	}

    	if (components.length === 1) {
    		return components;
    	}

    	split = split || 1;

    	// Split the array in 2 parts
    	var left = components.slice(0, split);
    	var right = components.slice(split);

    	return Array.prototype.concat.call([], decodeComponents(left), decodeComponents(right));
    }

    function decode(input) {
    	try {
    		return decodeURIComponent(input);
    	} catch (err) {
    		var tokens = input.match(singleMatcher);

    		for (var i = 1; i < tokens.length; i++) {
    			input = decodeComponents(tokens, i).join('');

    			tokens = input.match(singleMatcher);
    		}

    		return input;
    	}
    }

    function customDecodeURIComponent(input) {
    	// Keep track of all the replacements and prefill the map with the `BOM`
    	var replaceMap = {
    		'%FE%FF': '\uFFFD\uFFFD',
    		'%FF%FE': '\uFFFD\uFFFD'
    	};

    	var match = multiMatcher.exec(input);
    	while (match) {
    		try {
    			// Decode as big chunks as possible
    			replaceMap[match[0]] = decodeURIComponent(match[0]);
    		} catch (err) {
    			var result = decode(match[0]);

    			if (result !== match[0]) {
    				replaceMap[match[0]] = result;
    			}
    		}

    		match = multiMatcher.exec(input);
    	}

    	// Add `%C2` at the end of the map to make sure it does not replace the combinator before everything else
    	replaceMap['%C2'] = '\uFFFD';

    	var entries = Object.keys(replaceMap);

    	for (var i = 0; i < entries.length; i++) {
    		// Replace all decoded components
    		var key = entries[i];
    		input = input.replace(new RegExp(key, 'g'), replaceMap[key]);
    	}

    	return input;
    }

    var decodeUriComponent = function (encodedURI) {
    	if (typeof encodedURI !== 'string') {
    		throw new TypeError('Expected `encodedURI` to be of type `string`, got `' + typeof encodedURI + '`');
    	}

    	try {
    		encodedURI = encodedURI.replace(/\+/g, ' ');

    		// Try the built in decoder first
    		return decodeURIComponent(encodedURI);
    	} catch (err) {
    		// Fallback to a more advanced decoder
    		return customDecodeURIComponent(encodedURI);
    	}
    };

    var splitOnFirst = (string, separator) => {
    	if (!(typeof string === 'string' && typeof separator === 'string')) {
    		throw new TypeError('Expected the arguments to be of type `string`');
    	}

    	if (separator === '') {
    		return [string];
    	}

    	const separatorIndex = string.indexOf(separator);

    	if (separatorIndex === -1) {
    		return [string];
    	}

    	return [
    		string.slice(0, separatorIndex),
    		string.slice(separatorIndex + separator.length)
    	];
    };

    var queryString = createCommonjsModule(function (module, exports) {




    const isNullOrUndefined = value => value === null || value === undefined;

    function encoderForArrayFormat(options) {
    	switch (options.arrayFormat) {
    		case 'index':
    			return key => (result, value) => {
    				const index = result.length;

    				if (
    					value === undefined ||
    					(options.skipNull && value === null) ||
    					(options.skipEmptyString && value === '')
    				) {
    					return result;
    				}

    				if (value === null) {
    					return [...result, [encode(key, options), '[', index, ']'].join('')];
    				}

    				return [
    					...result,
    					[encode(key, options), '[', encode(index, options), ']=', encode(value, options)].join('')
    				];
    			};

    		case 'bracket':
    			return key => (result, value) => {
    				if (
    					value === undefined ||
    					(options.skipNull && value === null) ||
    					(options.skipEmptyString && value === '')
    				) {
    					return result;
    				}

    				if (value === null) {
    					return [...result, [encode(key, options), '[]'].join('')];
    				}

    				return [...result, [encode(key, options), '[]=', encode(value, options)].join('')];
    			};

    		case 'comma':
    		case 'separator':
    			return key => (result, value) => {
    				if (value === null || value === undefined || value.length === 0) {
    					return result;
    				}

    				if (result.length === 0) {
    					return [[encode(key, options), '=', encode(value, options)].join('')];
    				}

    				return [[result, encode(value, options)].join(options.arrayFormatSeparator)];
    			};

    		default:
    			return key => (result, value) => {
    				if (
    					value === undefined ||
    					(options.skipNull && value === null) ||
    					(options.skipEmptyString && value === '')
    				) {
    					return result;
    				}

    				if (value === null) {
    					return [...result, encode(key, options)];
    				}

    				return [...result, [encode(key, options), '=', encode(value, options)].join('')];
    			};
    	}
    }

    function parserForArrayFormat(options) {
    	let result;

    	switch (options.arrayFormat) {
    		case 'index':
    			return (key, value, accumulator) => {
    				result = /\[(\d*)\]$/.exec(key);

    				key = key.replace(/\[\d*\]$/, '');

    				if (!result) {
    					accumulator[key] = value;
    					return;
    				}

    				if (accumulator[key] === undefined) {
    					accumulator[key] = {};
    				}

    				accumulator[key][result[1]] = value;
    			};

    		case 'bracket':
    			return (key, value, accumulator) => {
    				result = /(\[\])$/.exec(key);
    				key = key.replace(/\[\]$/, '');

    				if (!result) {
    					accumulator[key] = value;
    					return;
    				}

    				if (accumulator[key] === undefined) {
    					accumulator[key] = [value];
    					return;
    				}

    				accumulator[key] = [].concat(accumulator[key], value);
    			};

    		case 'comma':
    		case 'separator':
    			return (key, value, accumulator) => {
    				const isArray = typeof value === 'string' && value.split('').indexOf(options.arrayFormatSeparator) > -1;
    				const newValue = isArray ? value.split(options.arrayFormatSeparator).map(item => decode(item, options)) : value === null ? value : decode(value, options);
    				accumulator[key] = newValue;
    			};

    		default:
    			return (key, value, accumulator) => {
    				if (accumulator[key] === undefined) {
    					accumulator[key] = value;
    					return;
    				}

    				accumulator[key] = [].concat(accumulator[key], value);
    			};
    	}
    }

    function validateArrayFormatSeparator(value) {
    	if (typeof value !== 'string' || value.length !== 1) {
    		throw new TypeError('arrayFormatSeparator must be single character string');
    	}
    }

    function encode(value, options) {
    	if (options.encode) {
    		return options.strict ? strictUriEncode(value) : encodeURIComponent(value);
    	}

    	return value;
    }

    function decode(value, options) {
    	if (options.decode) {
    		return decodeUriComponent(value);
    	}

    	return value;
    }

    function keysSorter(input) {
    	if (Array.isArray(input)) {
    		return input.sort();
    	}

    	if (typeof input === 'object') {
    		return keysSorter(Object.keys(input))
    			.sort((a, b) => Number(a) - Number(b))
    			.map(key => input[key]);
    	}

    	return input;
    }

    function removeHash(input) {
    	const hashStart = input.indexOf('#');
    	if (hashStart !== -1) {
    		input = input.slice(0, hashStart);
    	}

    	return input;
    }

    function getHash(url) {
    	let hash = '';
    	const hashStart = url.indexOf('#');
    	if (hashStart !== -1) {
    		hash = url.slice(hashStart);
    	}

    	return hash;
    }

    function extract(input) {
    	input = removeHash(input);
    	const queryStart = input.indexOf('?');
    	if (queryStart === -1) {
    		return '';
    	}

    	return input.slice(queryStart + 1);
    }

    function parseValue(value, options) {
    	if (options.parseNumbers && !Number.isNaN(Number(value)) && (typeof value === 'string' && value.trim() !== '')) {
    		value = Number(value);
    	} else if (options.parseBooleans && value !== null && (value.toLowerCase() === 'true' || value.toLowerCase() === 'false')) {
    		value = value.toLowerCase() === 'true';
    	}

    	return value;
    }

    function parse(input, options) {
    	options = Object.assign({
    		decode: true,
    		sort: true,
    		arrayFormat: 'none',
    		arrayFormatSeparator: ',',
    		parseNumbers: false,
    		parseBooleans: false
    	}, options);

    	validateArrayFormatSeparator(options.arrayFormatSeparator);

    	const formatter = parserForArrayFormat(options);

    	// Create an object with no prototype
    	const ret = Object.create(null);

    	if (typeof input !== 'string') {
    		return ret;
    	}

    	input = input.trim().replace(/^[?#&]/, '');

    	if (!input) {
    		return ret;
    	}

    	for (const param of input.split('&')) {
    		let [key, value] = splitOnFirst(options.decode ? param.replace(/\+/g, ' ') : param, '=');

    		// Missing `=` should be `null`:
    		// http://w3.org/TR/2012/WD-url-20120524/#collect-url-parameters
    		value = value === undefined ? null : ['comma', 'separator'].includes(options.arrayFormat) ? value : decode(value, options);
    		formatter(decode(key, options), value, ret);
    	}

    	for (const key of Object.keys(ret)) {
    		const value = ret[key];
    		if (typeof value === 'object' && value !== null) {
    			for (const k of Object.keys(value)) {
    				value[k] = parseValue(value[k], options);
    			}
    		} else {
    			ret[key] = parseValue(value, options);
    		}
    	}

    	if (options.sort === false) {
    		return ret;
    	}

    	return (options.sort === true ? Object.keys(ret).sort() : Object.keys(ret).sort(options.sort)).reduce((result, key) => {
    		const value = ret[key];
    		if (Boolean(value) && typeof value === 'object' && !Array.isArray(value)) {
    			// Sort object keys, not values
    			result[key] = keysSorter(value);
    		} else {
    			result[key] = value;
    		}

    		return result;
    	}, Object.create(null));
    }

    exports.extract = extract;
    exports.parse = parse;

    exports.stringify = (object, options) => {
    	if (!object) {
    		return '';
    	}

    	options = Object.assign({
    		encode: true,
    		strict: true,
    		arrayFormat: 'none',
    		arrayFormatSeparator: ','
    	}, options);

    	validateArrayFormatSeparator(options.arrayFormatSeparator);

    	const shouldFilter = key => (
    		(options.skipNull && isNullOrUndefined(object[key])) ||
    		(options.skipEmptyString && object[key] === '')
    	);

    	const formatter = encoderForArrayFormat(options);

    	const objectCopy = {};

    	for (const key of Object.keys(object)) {
    		if (!shouldFilter(key)) {
    			objectCopy[key] = object[key];
    		}
    	}

    	const keys = Object.keys(objectCopy);

    	if (options.sort !== false) {
    		keys.sort(options.sort);
    	}

    	return keys.map(key => {
    		const value = object[key];

    		if (value === undefined) {
    			return '';
    		}

    		if (value === null) {
    			return encode(key, options);
    		}

    		if (Array.isArray(value)) {
    			return value
    				.reduce(formatter(key), [])
    				.join('&');
    		}

    		return encode(key, options) + '=' + encode(value, options);
    	}).filter(x => x.length > 0).join('&');
    };

    exports.parseUrl = (input, options) => {
    	return {
    		url: removeHash(input).split('?')[0] || '',
    		query: parse(extract(input), options)
    	};
    };

    exports.stringifyUrl = (input, options) => {
    	const url = removeHash(input.url).split('?')[0] || '';
    	const queryFromUrl = exports.extract(input.url);
    	const parsedQueryFromUrl = exports.parse(queryFromUrl);
    	const hash = getHash(input.url);
    	const query = Object.assign(parsedQueryFromUrl, input.query);
    	let queryString = exports.stringify(query, options);
    	if (queryString) {
    		queryString = `?${queryString}`;
    	}

    	return `${url}${queryString}${hash}`;
    };
    });
    var queryString_1 = queryString.extract;
    var queryString_2 = queryString.parse;
    var queryString_3 = queryString.stringify;
    var queryString_4 = queryString.parseUrl;
    var queryString_5 = queryString.stringifyUrl;

    var index_umd = createCommonjsModule(function (module, exports) {
    (function (global, factory) {
       module.exports = factory() ;
    }(commonjsGlobal, (function () {
      var defaultExport = /*@__PURE__*/(function (Error) {
        function defaultExport(route, path) {
          var message = "Unreachable '" + (route !== '/' ? route.replace(/\/$/, '') : route) + "', segment '" + path + "' is not defined";
          Error.call(this, message);
          this.message = message;
          this.route = route;
          this.path = path;
        }

        if ( Error ) defaultExport.__proto__ = Error;
        defaultExport.prototype = Object.create( Error && Error.prototype );
        defaultExport.prototype.constructor = defaultExport;

        return defaultExport;
      }(Error));

      function buildMatcher(path, parent) {
        var regex;

        var _isSplat;

        var _priority = -100;

        var keys = [];
        regex = path.replace(/[-$.]/g, '\\$&').replace(/\(/g, '(?:').replace(/\)/g, ')?').replace(/([:*]\w+)(?:<([^<>]+?)>)?/g, function (_, key, expr) {
          keys.push(key.substr(1));

          if (key.charAt() === ':') {
            _priority += 100;
            return ("((?!#)" + (expr || '[^#/]+?') + ")");
          }

          _isSplat = true;
          _priority += 500;
          return ("((?!#)" + (expr || '[^#]+?') + ")");
        });

        try {
          regex = new RegExp(("^" + regex + "$"));
        } catch (e) {
          throw new TypeError(("Invalid route expression, given '" + parent + "'"));
        }

        var _hashed = path.includes('#') ? 0.5 : 1;

        var _depth = path.length * _priority * _hashed;

        return {
          keys: keys,
          regex: regex,
          _depth: _depth,
          _isSplat: _isSplat
        };
      }
      var PathMatcher = function PathMatcher(path, parent) {
        var ref = buildMatcher(path, parent);
        var keys = ref.keys;
        var regex = ref.regex;
        var _depth = ref._depth;
        var _isSplat = ref._isSplat;
        return {
          _isSplat: _isSplat,
          _depth: _depth,
          match: function (value) {
            var matches = value.match(regex);

            if (matches) {
              return keys.reduce(function (prev, cur, i) {
                prev[cur] = typeof matches[i + 1] === 'string' ? decodeURIComponent(matches[i + 1]) : null;
                return prev;
              }, {});
            }
          }
        };
      };

      PathMatcher.push = function push (key, prev, leaf, parent) {
        var root = prev[key] || (prev[key] = {});

        if (!root.pattern) {
          root.pattern = new PathMatcher(key, parent);
          root.route = (leaf || '').replace(/\/$/, '') || '/';
        }

        prev.keys = prev.keys || [];

        if (!prev.keys.includes(key)) {
          prev.keys.push(key);
          PathMatcher.sort(prev);
        }

        return root;
      };

      PathMatcher.sort = function sort (root) {
        root.keys.sort(function (a, b) {
          return root[a].pattern._depth - root[b].pattern._depth;
        });
      };

      function merge(path, parent) {
        return ("" + (parent && parent !== '/' ? parent : '') + (path || ''));
      }
      function walk(path, cb) {
        var matches = path.match(/<[^<>]*\/[^<>]*>/);

        if (matches) {
          throw new TypeError(("RegExp cannot contain slashes, given '" + matches + "'"));
        }

        var parts = path.split(/(?=\/|#)/);
        var root = [];

        if (parts[0] !== '/') {
          parts.unshift('/');
        }

        parts.some(function (x, i) {
          var parent = root.slice(1).concat(x).join('') || null;
          var segment = parts.slice(i + 1).join('') || null;
          var retval = cb(x, parent, segment ? ("" + (x !== '/' ? x : '') + segment) : null);
          root.push(x);
          return retval;
        });
      }
      function reduce(key, root, _seen) {
        var params = {};
        var out = [];
        var splat;
        walk(key, function (x, leaf, extra) {
          var found;

          if (!root.keys) {
            throw new defaultExport(key, x);
          }

          root.keys.some(function (k) {
            if (_seen.includes(k)) { return false; }
            var ref = root[k].pattern;
            var match = ref.match;
            var _isSplat = ref._isSplat;
            var matches = match(_isSplat ? extra || x : x);

            if (matches) {
              Object.assign(params, matches);

              if (root[k].route) {
                var routeInfo = Object.assign({}, root[k].info); // properly handle exact-routes!

                var hasMatch = false;

                if (routeInfo.exact) {
                  hasMatch = extra === null;
                } else {
                  hasMatch = !(x && leaf === null) || x === leaf || _isSplat || !extra;
                }

                routeInfo.matches = hasMatch;
                routeInfo.params = Object.assign({}, params);
                routeInfo.route = root[k].route;
                routeInfo.path = _isSplat && extra || leaf || x;
                out.push(routeInfo);
              }

              if (extra === null && !root[k].keys) {
                return true;
              }

              if (k !== '/') { _seen.push(k); }
              splat = _isSplat;
              root = root[k];
              found = true;
              return true;
            }

            return false;
          });

          if (!(found || root.keys.some(function (k) { return root[k].pattern.match(x); }))) {
            throw new defaultExport(key, x);
          }

          return splat || !found;
        });
        return out;
      }
      function find(path, routes, retries) {
        var get = reduce.bind(null, path, routes);
        var set = [];

        while (retries > 0) {
          retries -= 1;

          try {
            return get(set);
          } catch (e) {
            if (retries > 0) {
              return get(set);
            }

            throw e;
          }
        }
      }
      function add(path, routes, parent, routeInfo) {
        var fullpath = merge(path, parent);
        var root = routes;
        var key;

        if (routeInfo && routeInfo.nested !== true) {
          key = routeInfo.key;
          delete routeInfo.key;
        }

        walk(fullpath, function (x, leaf) {
          root = PathMatcher.push(x, root, leaf, fullpath);

          if (x !== '/') {
            root.info = root.info || Object.assign({}, routeInfo);
          }
        });
        root.info = root.info || Object.assign({}, routeInfo);

        if (key) {
          root.info.key = key;
        }

        return fullpath;
      }
      function rm(path, routes, parent) {
        var fullpath = merge(path, parent);
        var root = routes;
        var leaf = null;
        var key = null;
        walk(fullpath, function (x) {
          if (!root) {
            leaf = null;
            return true;
          }

          if (!root.keys) {
            throw new defaultExport(path, x);
          }

          key = x;
          leaf = root;
          root = root[key];
        });

        if (!(leaf && key)) {
          throw new defaultExport(path, key);
        }

        if (leaf === routes) {
          leaf = routes['/'];
        }

        if (leaf.route !== key) {
          var offset = leaf.keys.indexOf(key);

          if (offset === -1) {
            throw new defaultExport(path, key);
          }

          leaf.keys.splice(offset, 1);
          PathMatcher.sort(leaf);
          delete leaf[key];
        } // nested routes are upgradeable, so keep original info...


        if (root.route === leaf.route && (!root.info || root.info.key === leaf.info.key)) { delete leaf.info; }
      }

      var Router = function Router() {
        var routes = {};
        var stack = [];
        return {
          resolve: function (path, cb) {
            var url = path.split('?')[0];
            var seen = [];
            walk(url, function (x, leaf, extra) {
              try {
                cb(null, find(leaf, routes, 1).filter(function (r) {
                  if (!seen.includes(r.path)) {
                    seen.push(r.path);
                    return true;
                  }

                  return false;
                }));
              } catch (e) {
                cb(e, []);
              }
            });
          },
          mount: function (path, cb) {
            if (path !== '/') {
              stack.push(path);
            }

            cb();
            stack.pop();
          },
          find: function (path, retries) { return find(path, routes, retries === true ? 2 : retries || 1); },
          add: function (path, routeInfo) { return add(path, routes, stack.join(''), routeInfo); },
          rm: function (path) { return rm(path, routes, stack.join('')); }
        };
      };

      Router.matches = function matches (uri, path) {
        return buildMatcher(uri, path).regex.test(path);
      };

      return Router;

    })));
    });

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    const cache = {};
    const baseTag = document.getElementsByTagName('base');
    const basePrefix = (baseTag[0] && baseTag[0].href) || '/';

    const ROOT_URL = basePrefix.replace(window.location.origin, '');

    const router$1 = writable({
      path: '/',
      query: {},
      params: {},
      initial: true,
    });

    const CTX_ROUTER = {};
    const CTX_ROUTE = {};

    // use location.hash on embedded pages, e.g. Svelte REPL
    let HASHCHANGE = window.location.origin === 'null';

    function hashchangeEnable(value) {
      if (typeof value === 'boolean') {
        HASHCHANGE = !!value;
      }

      return HASHCHANGE;
    }

    function fixedLocation(path, callback, doFinally) {
      const baseUri = HASHCHANGE ? window.location.hash.replace('#', '') : window.location.pathname;

      // this will rebase anchors to avoid location changes
      if (path.charAt() !== '/') {
        path = baseUri + path;
      }

      const currentURL = baseUri + window.location.hash + window.location.search;

      // do not change location et all...
      if (currentURL !== path) {
        callback(path);
      }

      // invoke final guard regardless of previous result
      if (typeof doFinally === 'function') {
        doFinally();
      }
    }

    function cleanPath(uri, fix) {
      return uri !== '/' || fix ? uri.replace(/\/$/, '') : uri;
    }

    function navigateTo(path, options) {
      const {
        reload, replace,
        params, queryParams,
      } = options || {};

      // If path empty or no string, throws error
      if (!path || typeof path !== 'string' || (path[0] !== '/' && path[0] !== '#')) {
        throw new Error(`Expecting '/${path}' or '#${path}', given '${path}'`);
      }

      if (params) {
        path = path.replace(/:([a-zA-Z][a-zA-Z0-9_-]*)/g, (_, key) => params[key]);
      }

      if (queryParams) {
        const qs = queryString.stringify(queryParams);

        if (qs) {
          path += `?${qs}`;
        }
      }

      if (HASHCHANGE) {
        let fixedURL = path.replace(/^#|#$/g, '');

        if (ROOT_URL !== '/') {
          fixedURL = fixedURL.replace(cleanPath(ROOT_URL), '');
        }

        window.location.hash = fixedURL !== '/' ? fixedURL : '';
        return;
      }

      // If no History API support, fallbacks to URL redirect
      if (reload || !window.history.pushState || !window.dispatchEvent) {
        window.location.href = path;
        return;
      }

      // If has History API support, uses it
      fixedLocation(path, nextURL => {
        window.history[replace ? 'replaceState' : 'pushState'](null, '', nextURL);
        window.dispatchEvent(new Event('popstate'));
      });
    }

    function getProps(given, required) {
      const { props: sub, ...others } = given;

      // prune all declared props from this component
      required.forEach(k => {
        delete others[k];
      });

      return {
        ...sub,
        ...others,
      };
    }

    function isActive(uri, path, exact) {
      if (!cache[[uri, path, exact]]) {
        if (exact !== true && path.indexOf(uri) === 0) {
          cache[[uri, path, exact]] = /^[#/?]?$/.test(path.substr(uri.length, 1));
        } else if (uri.includes('*') || uri.includes(':')) {
          cache[[uri, path, exact]] = index_umd.matches(uri, path);
        } else {
          cache[[uri, path, exact]] = cleanPath(path) === uri;
        }
      }

      return cache[[uri, path, exact]];
    }

    function isPromise(object) {
      return object && typeof object.then === 'function';
    }

    function isSvelteComponent(object) {
      return object && object.prototype;
    }

    const baseRouter = new index_umd();
    const routeInfo = writable({});

    // private registries
    const onError = {};
    const shared = {};

    let errors = [];
    let routers = 0;
    let interval;
    let currentURL;

    // take snapshot from current state...
    router$1.subscribe(value => { shared.router = value; });
    routeInfo.subscribe(value => { shared.routeInfo = value; });

    function doFallback(failure, fallback) {
      routeInfo.update(defaults => ({
        ...defaults,
        [fallback]: {
          ...shared.router,
          failure,
        },
      }));
    }

    function handleRoutes(map, params) {
      const keys = [];

      map.some(x => {
        if (x.key && x.matches && !shared.routeInfo[x.key]) {
          if (x.redirect && (x.condition === null || x.condition(shared.router) !== true)) {
            if (x.exact && shared.router.path !== x.path) return false;
            navigateTo(x.redirect);
            return true;
          }

          if (x.exact) {
            keys.push(x.key);
          }

          // extend shared params...
          Object.assign(params, x.params);

          // upgrade matching routes!
          routeInfo.update(defaults => ({
            ...defaults,
            [x.key]: {
              ...shared.router,
              ...x,
            },
          }));
        }

        return false;
      });

      return keys;
    }

    function evtHandler() {
      let baseUri = !HASHCHANGE ? window.location.href.replace(window.location.origin, '') : window.location.hash || '/';
      let failure;

      // unprefix active URL
      if (ROOT_URL !== '/') {
        baseUri = baseUri.replace(cleanPath(ROOT_URL), '');
      }

      // trailing slash is required to keep route-info on nested routes!
      // see: https://github.com/pateketrueke/abstract-nested-router/commit/0f338384bddcfbaee30f3ea2c4eb0c24cf5174cd
      const [fixedUri, qs] = baseUri.replace('/#', '#').replace(/^#\//, '/').split('?');
      const fullpath = fixedUri.replace(/\/?$/, '/');
      const query = queryString.parse(qs);
      const params = {};
      const keys = [];

      // reset current state
      routeInfo.set({});

      if (currentURL !== baseUri) {
        currentURL = baseUri;
        router$1.set({
          path: cleanPath(fullpath),
          query,
          params,
        });
      }

      // load all matching routes...
      baseRouter.resolve(fullpath, (err, result) => {
        if (err) {
          failure = err;
          return;
        }

        // save exact-keys for deletion after failures!
        keys.push(...handleRoutes(result, params));
      });

      const toDelete = {};

      // it's fine to omit failures for '/' paths
      if (failure && failure.path !== '/') {
        keys.reduce((prev, cur) => {
          prev[cur] = null;
          return prev;
        }, toDelete);
      } else {
        failure = null;
      }

      // clear previously failed handlers
      errors.forEach(cb => cb());
      errors = [];

      try {
        // clear routes that not longer matches!
        baseRouter.find(cleanPath(fullpath))
          .forEach(sub => {
            if (sub.exact && !sub.matches) {
              toDelete[sub.key] = null;
            }
          });
      } catch (e) {
        // this is fine
      }

      // drop unwanted routes...
      routeInfo.update(defaults => ({
        ...defaults,
        ...toDelete,
      }));

      let fallback;

      // invoke error-handlers to clear out previous state!
      Object.keys(onError).forEach(root => {
        if (isActive(root, fullpath, false)) {
          const fn = onError[root].callback;

          fn(failure);
          errors.push(fn);
        }

        if (!fallback && onError[root].fallback) {
          fallback = onError[root].fallback;
        }
      });

      // handle unmatched fallbacks
      if (failure && fallback) {
        doFallback(failure, fallback);
      }
    }

    function findRoutes() {
      clearTimeout(interval);
      interval = setTimeout(evtHandler);
    }

    function addRouter(root, fallback, callback) {
      if (!routers) {
        window.addEventListener('popstate', findRoutes, false);
      }

      // register error-handlers
      if (!onError[root] || fallback) {
        onError[root] = { fallback, callback };
      }

      routers += 1;

      return () => {
        routers -= 1;

        if (!routers) {
          window.removeEventListener('popstate', findRoutes, false);
        }
      };
    }

    /* node_modules/yrv/src/Router.svelte generated by Svelte v3.21.0 */
    const file = "node_modules/yrv/src/Router.svelte";

    // (103:0) {#if !disabled}
    function create_if_block_1(ctx) {
    	let current;
    	const default_slot_template = /*$$slots*/ ctx[15].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[14], null);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 16384) {
    					default_slot.p(get_slot_context(default_slot_template, ctx, /*$$scope*/ ctx[14], null), get_slot_changes(default_slot_template, /*$$scope*/ ctx[14], dirty, null));
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(103:0) {#if !disabled}",
    		ctx
    	});

    	return block;
    }

    // (107:0) {#if failure && !fallback && !nofallback}
    function create_if_block(ctx) {
    	let fieldset;
    	let legend;
    	let t0;
    	let t1;
    	let t2;
    	let pre;
    	let t3;

    	const block = {
    		c: function create() {
    			fieldset = element("fieldset");
    			legend = element("legend");
    			t0 = text("Router failure: ");
    			t1 = text(/*path*/ ctx[1]);
    			t2 = space();
    			pre = element("pre");
    			t3 = text(/*failure*/ ctx[3]);
    			add_location(legend, file, 108, 4, 2300);
    			add_location(pre, file, 109, 4, 2344);
    			attr_dev(fieldset, "data-failure", "");
    			attr_dev(fieldset, "class", "svelte-kx2cky");
    			add_location(fieldset, file, 107, 2, 2272);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, fieldset, anchor);
    			append_dev(fieldset, legend);
    			append_dev(legend, t0);
    			append_dev(legend, t1);
    			append_dev(fieldset, t2);
    			append_dev(fieldset, pre);
    			append_dev(pre, t3);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*path*/ 2) set_data_dev(t1, /*path*/ ctx[1]);
    			if (dirty & /*failure*/ 8) set_data_dev(t3, /*failure*/ ctx[3]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(fieldset);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(107:0) {#if failure && !fallback && !nofallback}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let t;
    	let if_block1_anchor;
    	let current;
    	let if_block0 = !/*disabled*/ ctx[0] && create_if_block_1(ctx);
    	let if_block1 = /*failure*/ ctx[3] && !/*fallback*/ ctx[4] && !/*nofallback*/ ctx[2] && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			if (if_block0) if_block0.c();
    			t = space();
    			if (if_block1) if_block1.c();
    			if_block1_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, if_block1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (!/*disabled*/ ctx[0]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty & /*disabled*/ 1) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_1(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(t.parentNode, t);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (/*failure*/ ctx[3] && !/*fallback*/ ctx[4] && !/*nofallback*/ ctx[2]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block(ctx);
    					if_block1.c();
    					if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach_dev(t);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(if_block1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function unassignRoute(route) {
    	try {
    		baseRouter.rm(route);
    	} catch(e) {
    		
    	} // 🔥 this is fine...

    	findRoutes();
    }

    function instance($$self, $$props, $$invalidate) {
    	let $basePath;
    	let $router;
    	validate_store(router$1, "router");
    	component_subscribe($$self, router$1, $$value => $$invalidate(9, $router = $$value));
    	let cleanup;
    	let failure;
    	let fallback;
    	let { path = "/" } = $$props;
    	let { disabled = false } = $$props;
    	let { condition = null } = $$props;
    	let { nofallback = false } = $$props;
    	const routerContext = getContext(CTX_ROUTER);
    	const basePath = routerContext ? routerContext.basePath : writable(path);
    	validate_store(basePath, "basePath");
    	component_subscribe($$self, basePath, value => $$invalidate(8, $basePath = value));

    	const fixedRoot = $basePath !== path && $basePath !== "/"
    	? `${$basePath}${path !== "/" ? path : ""}`
    	: path;

    	try {
    		if (condition !== null && typeof condition !== "function") {
    			throw new TypeError(`Expecting condition to be a function, given '${condition}'`);
    		}

    		if (path.charAt() !== "#" && path.charAt() !== "/") {
    			throw new TypeError(`Expecting a leading slash or hash, given '${path}'`);
    		}
    	} catch(e) {
    		failure = e;
    	}

    	function assignRoute(key, route, detail) {
    		key = key || Math.random().toString(36).substr(2);

    		// consider as nested routes if they does not have any segment
    		const nested = !route.substr(1).includes("/");

    		const handler = { key, nested, ...detail };
    		let fullpath;

    		baseRouter.mount(fixedRoot, () => {
    			fullpath = baseRouter.add(route, handler);
    			$$invalidate(4, fallback = handler.fallback && key || fallback);
    		});

    		findRoutes();
    		return [key, fullpath];
    	}

    	function onError(err) {
    		$$invalidate(3, failure = err);

    		if (failure && fallback) {
    			doFallback(failure, fallback);
    		}
    	}

    	onMount(() => {
    		cleanup = addRouter(fixedRoot, fallback, onError);
    	});

    	onDestroy(() => {
    		if (cleanup) cleanup();
    	});

    	setContext(CTX_ROUTER, { basePath, assignRoute, unassignRoute });
    	const writable_props = ["path", "disabled", "condition", "nofallback"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Router> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Router", $$slots, ['default']);

    	$$self.$set = $$props => {
    		if ("path" in $$props) $$invalidate(1, path = $$props.path);
    		if ("disabled" in $$props) $$invalidate(0, disabled = $$props.disabled);
    		if ("condition" in $$props) $$invalidate(6, condition = $$props.condition);
    		if ("nofallback" in $$props) $$invalidate(2, nofallback = $$props.nofallback);
    		if ("$$scope" in $$props) $$invalidate(14, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		writable,
    		CTX_ROUTER,
    		router: router$1,
    		baseRouter,
    		addRouter,
    		findRoutes,
    		doFallback,
    		onMount,
    		onDestroy,
    		getContext,
    		setContext,
    		cleanup,
    		failure,
    		fallback,
    		path,
    		disabled,
    		condition,
    		nofallback,
    		routerContext,
    		basePath,
    		fixedRoot,
    		assignRoute,
    		unassignRoute,
    		onError,
    		$basePath,
    		$router
    	});

    	$$self.$inject_state = $$props => {
    		if ("cleanup" in $$props) cleanup = $$props.cleanup;
    		if ("failure" in $$props) $$invalidate(3, failure = $$props.failure);
    		if ("fallback" in $$props) $$invalidate(4, fallback = $$props.fallback);
    		if ("path" in $$props) $$invalidate(1, path = $$props.path);
    		if ("disabled" in $$props) $$invalidate(0, disabled = $$props.disabled);
    		if ("condition" in $$props) $$invalidate(6, condition = $$props.condition);
    		if ("nofallback" in $$props) $$invalidate(2, nofallback = $$props.nofallback);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*condition, $router*/ 576) {
    			 if (condition) {
    				$$invalidate(0, disabled = !condition($router));
    			}
    		}
    	};

    	return [
    		disabled,
    		path,
    		nofallback,
    		failure,
    		fallback,
    		basePath,
    		condition,
    		cleanup,
    		$basePath,
    		$router,
    		routerContext,
    		fixedRoot,
    		assignRoute,
    		onError,
    		$$scope,
    		$$slots
    	];
    }

    class Router extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance, create_fragment, safe_not_equal, {
    			path: 1,
    			disabled: 0,
    			condition: 6,
    			nofallback: 2
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Router",
    			options,
    			id: create_fragment.name
    		});
    	}

    	get path() {
    		throw new Error("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set path(value) {
    		throw new Error("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabled() {
    		throw new Error("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get condition() {
    		throw new Error("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set condition(value) {
    		throw new Error("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get nofallback() {
    		throw new Error("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set nofallback(value) {
    		throw new Error("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/yrv/src/Route.svelte generated by Svelte v3.21.0 */
    const file$1 = "node_modules/yrv/src/Route.svelte";

    const get_default_slot_changes = dirty => ({
    	router: dirty & /*activeRouter*/ 4,
    	props: dirty & /*activeProps*/ 8
    });

    const get_default_slot_context = ctx => ({
    	router: /*activeRouter*/ ctx[2],
    	props: /*activeProps*/ ctx[3]
    });

    // (110:0) {#if failure}
    function create_if_block_5(ctx) {
    	let p;
    	let t;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t = text(/*failure*/ ctx[4]);
    			attr_dev(p, "data-failure", "");
    			attr_dev(p, "class", "svelte-7lze0z");
    			add_location(p, file$1, 110, 2, 2923);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*failure*/ 16) set_data_dev(t, /*failure*/ ctx[4]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5.name,
    		type: "if",
    		source: "(110:0) {#if failure}",
    		ctx
    	});

    	return block;
    }

    // (114:0) {#if activeRouter}
    function create_if_block$1(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block_1$1, create_if_block_4, create_else_block_1];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (!/*hasLoaded*/ ctx[5]) return 0;
    		if (/*component*/ ctx[0]) return 1;
    		return 2;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(114:0) {#if activeRouter}",
    		ctx
    	});

    	return block;
    }

    // (126:4) {:else}
    function create_else_block_1(ctx) {
    	let current;
    	const default_slot_template = /*$$slots*/ ctx[25].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[24], get_default_slot_context);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope, activeRouter, activeProps*/ 16777228) {
    					default_slot.p(get_slot_context(default_slot_template, ctx, /*$$scope*/ ctx[24], get_default_slot_context), get_slot_changes(default_slot_template, /*$$scope*/ ctx[24], dirty, get_default_slot_changes));
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1.name,
    		type: "else",
    		source: "(126:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (124:4) {#if component}
    function create_if_block_4(ctx) {
    	let switch_instance_anchor;
    	let current;
    	const switch_instance_spread_levels = [{ router: /*activeRouter*/ ctx[2] }, /*activeProps*/ ctx[3]];
    	var switch_value = /*component*/ ctx[0];

    	function switch_props(ctx) {
    		let switch_instance_props = {};

    		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}

    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		var switch_instance = new switch_value(switch_props());
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = (dirty & /*activeRouter, activeProps*/ 12)
    			? get_spread_update(switch_instance_spread_levels, [
    					dirty & /*activeRouter*/ 4 && { router: /*activeRouter*/ ctx[2] },
    					dirty & /*activeProps*/ 8 && get_spread_object(/*activeProps*/ ctx[3])
    				])
    			: {};

    			if (switch_value !== (switch_value = /*component*/ ctx[0])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(124:4) {#if component}",
    		ctx
    	});

    	return block;
    }

    // (115:2) {#if !hasLoaded}
    function create_if_block_1$1(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*pending*/ ctx[1] && create_if_block_2(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (/*pending*/ ctx[1]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*pending*/ 2) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block_2(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(115:2) {#if !hasLoaded}",
    		ctx
    	});

    	return block;
    }

    // (116:4) {#if pending}
    function create_if_block_2(ctx) {
    	let show_if;
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block_3, create_else_block];
    	const if_blocks = [];

    	function select_block_type_1(ctx, dirty) {
    		if (dirty & /*pending*/ 2) show_if = !!isSvelteComponent(/*pending*/ ctx[1]);
    		if (show_if) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type_1(ctx, -1);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type_1(ctx, dirty);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(116:4) {#if pending}",
    		ctx
    	});

    	return block;
    }

    // (119:6) {:else}
    function create_else_block(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text(/*pending*/ ctx[1]);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*pending*/ 2) set_data_dev(t, /*pending*/ ctx[1]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(119:6) {:else}",
    		ctx
    	});

    	return block;
    }

    // (117:6) {#if isSvelteComponent(pending)}
    function create_if_block_3(ctx) {
    	let switch_instance_anchor;
    	let current;
    	const switch_instance_spread_levels = [{ router: /*activeRouter*/ ctx[2] }, /*activeProps*/ ctx[3]];
    	var switch_value = /*pending*/ ctx[1];

    	function switch_props(ctx) {
    		let switch_instance_props = {};

    		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}

    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		var switch_instance = new switch_value(switch_props());
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = (dirty & /*activeRouter, activeProps*/ 12)
    			? get_spread_update(switch_instance_spread_levels, [
    					dirty & /*activeRouter*/ 4 && { router: /*activeRouter*/ ctx[2] },
    					dirty & /*activeProps*/ 8 && get_spread_object(/*activeProps*/ ctx[3])
    				])
    			: {};

    			if (switch_value !== (switch_value = /*pending*/ ctx[1])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(117:6) {#if isSvelteComponent(pending)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let t;
    	let if_block1_anchor;
    	let current;
    	let if_block0 = /*failure*/ ctx[4] && create_if_block_5(ctx);
    	let if_block1 = /*activeRouter*/ ctx[2] && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			if (if_block0) if_block0.c();
    			t = space();
    			if (if_block1) if_block1.c();
    			if_block1_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, if_block1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*failure*/ ctx[4]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_5(ctx);
    					if_block0.c();
    					if_block0.m(t.parentNode, t);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*activeRouter*/ ctx[2]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty & /*activeRouter*/ 4) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block$1(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block1);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block1);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach_dev(t);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(if_block1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let $routePath;
    	let $routeInfo;
    	validate_store(routeInfo, "routeInfo");
    	component_subscribe($$self, routeInfo, $$value => $$invalidate(16, $routeInfo = $$value));
    	let { key = null } = $$props;
    	let { path = "/" } = $$props;
    	let { exact = null } = $$props;
    	let { pending = null } = $$props;
    	let { disabled = false } = $$props;
    	let { fallback = null } = $$props;
    	let { component = null } = $$props;
    	let { condition = null } = $$props;
    	let { redirect = null } = $$props;

    	// replacement for `Object.keys(arguments[0].$$.props)`
    	const thisProps = [
    		"key",
    		"path",
    		"exact",
    		"pending",
    		"disabled",
    		"fallback",
    		"component",
    		"condition",
    		"redirect"
    	];

    	const routeContext = getContext(CTX_ROUTE);
    	const routerContext = getContext(CTX_ROUTER);
    	const { assignRoute, unassignRoute } = routerContext || {};
    	const routePath = routeContext ? routeContext.routePath : writable(path);
    	validate_store(routePath, "routePath");
    	component_subscribe($$self, routePath, value => $$invalidate(15, $routePath = value));
    	let activeRouter = null;
    	let activeProps = {};
    	let fullpath;
    	let failure;
    	let hasLoaded;

    	const fixedRoot = $routePath !== path && $routePath !== "/"
    	? `${$routePath}${path !== "/" ? path : ""}`
    	: path;

    	try {
    		if (redirect !== null && !(/^(?:\w+:\/\/|\/)/).test(redirect)) {
    			throw new TypeError(`Expecting valid URL to redirect, given '${redirect}'`);
    		}

    		if (condition !== null && typeof condition !== "function") {
    			throw new TypeError(`Expecting condition to be a function, given '${condition}'`);
    		}

    		if (path.charAt() !== "#" && path.charAt() !== "/") {
    			throw new TypeError(`Expecting a leading slash or hash, given '${path}'`);
    		}

    		if (!assignRoute) {
    			throw new TypeError(`Missing top-level <Router>, given route: ${path}`);
    		}

    		const fixedRoute = path !== fixedRoot && fixedRoot.substr(-1) !== "/"
    		? `${fixedRoot}/`
    		: fixedRoot;

    		[key, fullpath] = assignRoute(key, fixedRoute, { condition, redirect, fallback, exact });
    	} catch(e) {
    		failure = e;
    	}

    	onDestroy(() => {
    		if (unassignRoute) {
    			unassignRoute(fullpath);
    		}
    	});

    	setContext(CTX_ROUTE, { routePath });
    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Route", $$slots, ['default']);

    	$$self.$set = $$new_props => {
    		$$invalidate(23, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ("key" in $$new_props) $$invalidate(7, key = $$new_props.key);
    		if ("path" in $$new_props) $$invalidate(8, path = $$new_props.path);
    		if ("exact" in $$new_props) $$invalidate(9, exact = $$new_props.exact);
    		if ("pending" in $$new_props) $$invalidate(1, pending = $$new_props.pending);
    		if ("disabled" in $$new_props) $$invalidate(10, disabled = $$new_props.disabled);
    		if ("fallback" in $$new_props) $$invalidate(11, fallback = $$new_props.fallback);
    		if ("component" in $$new_props) $$invalidate(0, component = $$new_props.component);
    		if ("condition" in $$new_props) $$invalidate(12, condition = $$new_props.condition);
    		if ("redirect" in $$new_props) $$invalidate(13, redirect = $$new_props.redirect);
    		if ("$$scope" in $$new_props) $$invalidate(24, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		writable,
    		routeInfo,
    		CTX_ROUTER,
    		CTX_ROUTE,
    		getProps,
    		isPromise,
    		isSvelteComponent,
    		onDestroy,
    		getContext,
    		setContext,
    		key,
    		path,
    		exact,
    		pending,
    		disabled,
    		fallback,
    		component,
    		condition,
    		redirect,
    		thisProps,
    		routeContext,
    		routerContext,
    		assignRoute,
    		unassignRoute,
    		routePath,
    		activeRouter,
    		activeProps,
    		fullpath,
    		failure,
    		hasLoaded,
    		fixedRoot,
    		$routePath,
    		$routeInfo
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(23, $$props = assign(assign({}, $$props), $$new_props));
    		if ("key" in $$props) $$invalidate(7, key = $$new_props.key);
    		if ("path" in $$props) $$invalidate(8, path = $$new_props.path);
    		if ("exact" in $$props) $$invalidate(9, exact = $$new_props.exact);
    		if ("pending" in $$props) $$invalidate(1, pending = $$new_props.pending);
    		if ("disabled" in $$props) $$invalidate(10, disabled = $$new_props.disabled);
    		if ("fallback" in $$props) $$invalidate(11, fallback = $$new_props.fallback);
    		if ("component" in $$props) $$invalidate(0, component = $$new_props.component);
    		if ("condition" in $$props) $$invalidate(12, condition = $$new_props.condition);
    		if ("redirect" in $$props) $$invalidate(13, redirect = $$new_props.redirect);
    		if ("activeRouter" in $$props) $$invalidate(2, activeRouter = $$new_props.activeRouter);
    		if ("activeProps" in $$props) $$invalidate(3, activeProps = $$new_props.activeProps);
    		if ("fullpath" in $$props) fullpath = $$new_props.fullpath;
    		if ("failure" in $$props) $$invalidate(4, failure = $$new_props.failure);
    		if ("hasLoaded" in $$props) $$invalidate(5, hasLoaded = $$new_props.hasLoaded);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		 if (key) {
    			$$invalidate(2, activeRouter = !disabled && $routeInfo[key]);
    			$$invalidate(3, activeProps = getProps($$props, thisProps));
    		}

    		if ($$self.$$.dirty & /*activeRouter, component*/ 5) {
    			 if (activeRouter) {
    				if (!component) {
    					// component passed as slot
    					$$invalidate(5, hasLoaded = true);
    				} else if (isSvelteComponent(component)) {
    					// component passed as Svelte component
    					$$invalidate(5, hasLoaded = true);
    				} else if (isPromise(component)) {
    					// component passed as import()
    					component.then(module => {
    						$$invalidate(0, component = module.default);
    						$$invalidate(5, hasLoaded = true);
    					});
    				} else {
    					// component passed as () => import()
    					component().then(module => {
    						$$invalidate(0, component = module.default);
    						$$invalidate(5, hasLoaded = true);
    					});
    				}
    			}
    		}
    	};

    	$$props = exclude_internal_props($$props);

    	return [
    		component,
    		pending,
    		activeRouter,
    		activeProps,
    		failure,
    		hasLoaded,
    		routePath,
    		key,
    		path,
    		exact,
    		disabled,
    		fallback,
    		condition,
    		redirect,
    		fullpath,
    		$routePath,
    		$routeInfo,
    		thisProps,
    		routeContext,
    		routerContext,
    		assignRoute,
    		unassignRoute,
    		fixedRoot,
    		$$props,
    		$$scope,
    		$$slots
    	];
    }

    class Route extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {
    			key: 7,
    			path: 8,
    			exact: 9,
    			pending: 1,
    			disabled: 10,
    			fallback: 11,
    			component: 0,
    			condition: 12,
    			redirect: 13
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Route",
    			options,
    			id: create_fragment$1.name
    		});
    	}

    	get key() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set key(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get path() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set path(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get exact() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set exact(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get pending() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set pending(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabled() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get fallback() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set fallback(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get component() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set component(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get condition() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set condition(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get redirect() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set redirect(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/yrv/src/Link.svelte generated by Svelte v3.21.0 */

    const file$2 = "node_modules/yrv/src/Link.svelte";

    // (97:0) {:else}
    function create_else_block$1(ctx) {
    	let a;
    	let current;
    	let dispose;
    	const default_slot_template = /*$$slots*/ ctx[19].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[18], null);

    	let a_levels = [
    		/*fixedProps*/ ctx[6],
    		{
    			href: cleanPath(/*fixedHref*/ ctx[5] || /*href*/ ctx[1])
    		},
    		{ class: /*cssClass*/ ctx[0] },
    		{ title: /*title*/ ctx[2] }
    	];

    	let a_data = {};

    	for (let i = 0; i < a_levels.length; i += 1) {
    		a_data = assign(a_data, a_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			a = element("a");
    			if (default_slot) default_slot.c();
    			set_attributes(a, a_data);
    			add_location(a, file$2, 97, 2, 2699);
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, a, anchor);

    			if (default_slot) {
    				default_slot.m(a, null);
    			}

    			/*a_binding*/ ctx[21](a);
    			current = true;
    			if (remount) dispose();
    			dispose = listen_dev(a, "click", prevent_default(/*onClick*/ ctx[7]), false, true, false);
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 262144) {
    					default_slot.p(get_slot_context(default_slot_template, ctx, /*$$scope*/ ctx[18], null), get_slot_changes(default_slot_template, /*$$scope*/ ctx[18], dirty, null));
    				}
    			}

    			set_attributes(a, get_spread_update(a_levels, [
    				dirty & /*fixedProps*/ 64 && /*fixedProps*/ ctx[6],
    				dirty & /*cleanPath, fixedHref, href*/ 34 && {
    					href: cleanPath(/*fixedHref*/ ctx[5] || /*href*/ ctx[1])
    				},
    				dirty & /*cssClass*/ 1 && { class: /*cssClass*/ ctx[0] },
    				dirty & /*title*/ 4 && { title: /*title*/ ctx[2] }
    			]));
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    			if (default_slot) default_slot.d(detaching);
    			/*a_binding*/ ctx[21](null);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(97:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (93:0) {#if button}
    function create_if_block$2(ctx) {
    	let button_1;
    	let current;
    	let dispose;
    	const default_slot_template = /*$$slots*/ ctx[19].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[18], null);

    	let button_1_levels = [
    		/*fixedProps*/ ctx[6],
    		{ class: /*cssClass*/ ctx[0] },
    		{ title: /*title*/ ctx[2] }
    	];

    	let button_1_data = {};

    	for (let i = 0; i < button_1_levels.length; i += 1) {
    		button_1_data = assign(button_1_data, button_1_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			button_1 = element("button");
    			if (default_slot) default_slot.c();
    			set_attributes(button_1, button_1_data);
    			add_location(button_1, file$2, 93, 2, 2564);
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, button_1, anchor);

    			if (default_slot) {
    				default_slot.m(button_1, null);
    			}

    			/*button_1_binding*/ ctx[20](button_1);
    			current = true;
    			if (remount) dispose();
    			dispose = listen_dev(button_1, "click", prevent_default(/*onClick*/ ctx[7]), false, true, false);
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 262144) {
    					default_slot.p(get_slot_context(default_slot_template, ctx, /*$$scope*/ ctx[18], null), get_slot_changes(default_slot_template, /*$$scope*/ ctx[18], dirty, null));
    				}
    			}

    			set_attributes(button_1, get_spread_update(button_1_levels, [
    				dirty & /*fixedProps*/ 64 && /*fixedProps*/ ctx[6],
    				dirty & /*cssClass*/ 1 && { class: /*cssClass*/ ctx[0] },
    				dirty & /*title*/ 4 && { title: /*title*/ ctx[2] }
    			]));
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button_1);
    			if (default_slot) default_slot.d(detaching);
    			/*button_1_binding*/ ctx[20](null);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(93:0) {#if button}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block$2, create_else_block$1];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*button*/ ctx[3]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let $router;
    	validate_store(router$1, "router");
    	component_subscribe($$self, router$1, $$value => $$invalidate(14, $router = $$value));
    	let ref;
    	let active;
    	let { class: cssClass = "" } = $$props;
    	let fixedHref = null;
    	let { go = null } = $$props;
    	let { open = null } = $$props;
    	let { href = "/" } = $$props;
    	let { title = "" } = $$props;
    	let { button = false } = $$props;
    	let { exact = false } = $$props;
    	let { reload = false } = $$props;
    	let { replace = false } = $$props;

    	// replacement for `Object.keys(arguments[0].$$.props)`
    	const thisProps = ["go", "open", "href", "class", "title", "button", "exact", "reload", "replace"];

    	const dispatch = createEventDispatcher();

    	// this will enable `<Link on:click={...} />` calls
    	function onClick(e) {
    		if (typeof go === "string" && window.history.length > 1) {
    			if (go === "back") window.history.back(); else if (go === "fwd") window.history.forward(); else window.history.go(parseInt(go, 10));
    			return;
    		}

    		if (!fixedHref) {
    			if (open) {
    				let specs = typeof open === "string" ? open : "";
    				const wmatch = specs.match(/width=(\d+)/);
    				const hmatch = specs.match(/height=(\d+)/);
    				if (wmatch) specs += `,left=${(window.screen.width - wmatch[1]) / 2}`;
    				if (hmatch) specs += `,top=${(window.screen.height - hmatch[1]) / 2}`;

    				if (wmatch && !hmatch) {
    					specs += `,height=${wmatch[1]},top=${(window.screen.height - wmatch[1]) / 2}`;
    				}

    				const w = window.open(href, "", specs);

    				const t = setInterval(
    					() => {
    						if (w.closed) {
    							dispatch("close");
    							clearInterval(t);
    						}
    					},
    					120
    				);
    			} else window.location.href = href;

    			return;
    		}

    		fixedLocation(
    			href,
    			() => {
    				navigateTo(fixedHref, { reload, replace });
    			},
    			() => dispatch("click", e)
    		);
    	}

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Link", $$slots, ['default']);

    	function button_1_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			$$invalidate(4, ref = $$value);
    		});
    	}

    	function a_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			$$invalidate(4, ref = $$value);
    		});
    	}

    	$$self.$set = $$new_props => {
    		$$invalidate(17, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ("class" in $$new_props) $$invalidate(0, cssClass = $$new_props.class);
    		if ("go" in $$new_props) $$invalidate(8, go = $$new_props.go);
    		if ("open" in $$new_props) $$invalidate(9, open = $$new_props.open);
    		if ("href" in $$new_props) $$invalidate(1, href = $$new_props.href);
    		if ("title" in $$new_props) $$invalidate(2, title = $$new_props.title);
    		if ("button" in $$new_props) $$invalidate(3, button = $$new_props.button);
    		if ("exact" in $$new_props) $$invalidate(10, exact = $$new_props.exact);
    		if ("reload" in $$new_props) $$invalidate(11, reload = $$new_props.reload);
    		if ("replace" in $$new_props) $$invalidate(12, replace = $$new_props.replace);
    		if ("$$scope" in $$new_props) $$invalidate(18, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		ROOT_URL,
    		HASHCHANGE,
    		fixedLocation,
    		navigateTo,
    		cleanPath,
    		isActive,
    		getProps,
    		router: router$1,
    		ref,
    		active,
    		cssClass,
    		fixedHref,
    		go,
    		open,
    		href,
    		title,
    		button,
    		exact,
    		reload,
    		replace,
    		thisProps,
    		dispatch,
    		onClick,
    		$router,
    		fixedProps
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(17, $$props = assign(assign({}, $$props), $$new_props));
    		if ("ref" in $$props) $$invalidate(4, ref = $$new_props.ref);
    		if ("active" in $$props) $$invalidate(13, active = $$new_props.active);
    		if ("cssClass" in $$props) $$invalidate(0, cssClass = $$new_props.cssClass);
    		if ("fixedHref" in $$props) $$invalidate(5, fixedHref = $$new_props.fixedHref);
    		if ("go" in $$props) $$invalidate(8, go = $$new_props.go);
    		if ("open" in $$props) $$invalidate(9, open = $$new_props.open);
    		if ("href" in $$props) $$invalidate(1, href = $$new_props.href);
    		if ("title" in $$props) $$invalidate(2, title = $$new_props.title);
    		if ("button" in $$props) $$invalidate(3, button = $$new_props.button);
    		if ("exact" in $$props) $$invalidate(10, exact = $$new_props.exact);
    		if ("reload" in $$props) $$invalidate(11, reload = $$new_props.reload);
    		if ("replace" in $$props) $$invalidate(12, replace = $$new_props.replace);
    		if ("fixedProps" in $$props) $$invalidate(6, fixedProps = $$new_props.fixedProps);
    	};

    	let fixedProps;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*href*/ 2) {
    			// rebase active URL
    			 if (!(/^(\w+:)?\/\//).test(href)) {
    				$$invalidate(5, fixedHref = cleanPath(ROOT_URL, true) + cleanPath(HASHCHANGE ? `#${href}` : href));
    			}
    		}

    		if ($$self.$$.dirty & /*ref, $router, href, exact, active, button*/ 25626) {
    			 if (ref && $router.path) {
    				if (isActive(href, $router.path, exact)) {
    					if (!active) {
    						$$invalidate(13, active = true);
    						ref.setAttribute("aria-current", "page");

    						if (button) {
    							ref.setAttribute("disabled", true);
    						}
    					}
    				} else if (active) {
    					$$invalidate(13, active = false);
    					ref.removeAttribute("disabled");
    					ref.removeAttribute("aria-current");
    				}
    			}
    		}

    		// extract additional props
    		 $$invalidate(6, fixedProps = getProps($$props, thisProps));
    	};

    	$$props = exclude_internal_props($$props);

    	return [
    		cssClass,
    		href,
    		title,
    		button,
    		ref,
    		fixedHref,
    		fixedProps,
    		onClick,
    		go,
    		open,
    		exact,
    		reload,
    		replace,
    		active,
    		$router,
    		thisProps,
    		dispatch,
    		$$props,
    		$$scope,
    		$$slots,
    		button_1_binding,
    		a_binding
    	];
    }

    class Link extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {
    			class: 0,
    			go: 8,
    			open: 9,
    			href: 1,
    			title: 2,
    			button: 3,
    			exact: 10,
    			reload: 11,
    			replace: 12
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Link",
    			options,
    			id: create_fragment$2.name
    		});
    	}

    	get class() {
    		throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get go() {
    		throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set go(value) {
    		throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get open() {
    		throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set open(value) {
    		throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get href() {
    		throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set href(value) {
    		throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get title() {
    		throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get button() {
    		throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set button(value) {
    		throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get exact() {
    		throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set exact(value) {
    		throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get reload() {
    		throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set reload(value) {
    		throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get replace() {
    		throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set replace(value) {
    		throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    Object.defineProperty(Router, 'hashchange', {
      set: value => hashchangeEnable(value),
      get: () => hashchangeEnable(),
      configurable: false,
      enumerable: false,
    });

    /**
     * SSR Window 1.0.1
     * Better handling for window object in SSR environment
     * https://github.com/nolimits4web/ssr-window
     *
     * Copyright 2018, Vladimir Kharlampidi
     *
     * Licensed under MIT
     *
     * Released on: July 18, 2018
     */
    var doc = (typeof document === 'undefined') ? {
      body: {},
      addEventListener: function addEventListener() {},
      removeEventListener: function removeEventListener() {},
      activeElement: {
        blur: function blur() {},
        nodeName: '',
      },
      querySelector: function querySelector() {
        return null;
      },
      querySelectorAll: function querySelectorAll() {
        return [];
      },
      getElementById: function getElementById() {
        return null;
      },
      createEvent: function createEvent() {
        return {
          initEvent: function initEvent() {},
        };
      },
      createElement: function createElement() {
        return {
          children: [],
          childNodes: [],
          style: {},
          setAttribute: function setAttribute() {},
          getElementsByTagName: function getElementsByTagName() {
            return [];
          },
        };
      },
      location: { hash: '' },
    } : document; // eslint-disable-line

    var win = (typeof window === 'undefined') ? {
      document: doc,
      navigator: {
        userAgent: '',
      },
      location: {},
      history: {},
      CustomEvent: function CustomEvent() {
        return this;
      },
      addEventListener: function addEventListener() {},
      removeEventListener: function removeEventListener() {},
      getComputedStyle: function getComputedStyle() {
        return {
          getPropertyValue: function getPropertyValue() {
            return '';
          },
        };
      },
      Image: function Image() {},
      Date: function Date() {},
      screen: {},
      setTimeout: function setTimeout() {},
      clearTimeout: function clearTimeout() {},
    } : window; // eslint-disable-line

    /**
     * Dom7 2.1.3
     * Minimalistic JavaScript library for DOM manipulation, with a jQuery-compatible API
     * http://framework7.io/docs/dom.html
     *
     * Copyright 2019, Vladimir Kharlampidi
     * The iDangero.us
     * http://www.idangero.us/
     *
     * Licensed under MIT
     *
     * Released on: February 11, 2019
     */

    class Dom7 {
      constructor(arr) {
        const self = this;
        // Create array-like object
        for (let i = 0; i < arr.length; i += 1) {
          self[i] = arr[i];
        }
        self.length = arr.length;
        // Return collection with methods
        return this;
      }
    }

    function $(selector, context) {
      const arr = [];
      let i = 0;
      if (selector && !context) {
        if (selector instanceof Dom7) {
          return selector;
        }
      }
      if (selector) {
          // String
        if (typeof selector === 'string') {
          let els;
          let tempParent;
          const html = selector.trim();
          if (html.indexOf('<') >= 0 && html.indexOf('>') >= 0) {
            let toCreate = 'div';
            if (html.indexOf('<li') === 0) toCreate = 'ul';
            if (html.indexOf('<tr') === 0) toCreate = 'tbody';
            if (html.indexOf('<td') === 0 || html.indexOf('<th') === 0) toCreate = 'tr';
            if (html.indexOf('<tbody') === 0) toCreate = 'table';
            if (html.indexOf('<option') === 0) toCreate = 'select';
            tempParent = doc.createElement(toCreate);
            tempParent.innerHTML = html;
            for (i = 0; i < tempParent.childNodes.length; i += 1) {
              arr.push(tempParent.childNodes[i]);
            }
          } else {
            if (!context && selector[0] === '#' && !selector.match(/[ .<>:~]/)) {
              // Pure ID selector
              els = [doc.getElementById(selector.trim().split('#')[1])];
            } else {
              // Other selectors
              els = (context || doc).querySelectorAll(selector.trim());
            }
            for (i = 0; i < els.length; i += 1) {
              if (els[i]) arr.push(els[i]);
            }
          }
        } else if (selector.nodeType || selector === win || selector === doc) {
          // Node/element
          arr.push(selector);
        } else if (selector.length > 0 && selector[0].nodeType) {
          // Array of elements or instance of Dom
          for (i = 0; i < selector.length; i += 1) {
            arr.push(selector[i]);
          }
        }
      }
      return new Dom7(arr);
    }

    $.fn = Dom7.prototype;
    $.Class = Dom7;
    $.Dom7 = Dom7;

    function unique(arr) {
      const uniqueArray = [];
      for (let i = 0; i < arr.length; i += 1) {
        if (uniqueArray.indexOf(arr[i]) === -1) uniqueArray.push(arr[i]);
      }
      return uniqueArray;
    }

    // Classes and attributes
    function addClass(className) {
      if (typeof className === 'undefined') {
        return this;
      }
      const classes = className.split(' ');
      for (let i = 0; i < classes.length; i += 1) {
        for (let j = 0; j < this.length; j += 1) {
          if (typeof this[j] !== 'undefined' && typeof this[j].classList !== 'undefined') this[j].classList.add(classes[i]);
        }
      }
      return this;
    }
    function removeClass(className) {
      const classes = className.split(' ');
      for (let i = 0; i < classes.length; i += 1) {
        for (let j = 0; j < this.length; j += 1) {
          if (typeof this[j] !== 'undefined' && typeof this[j].classList !== 'undefined') this[j].classList.remove(classes[i]);
        }
      }
      return this;
    }
    function hasClass(className) {
      if (!this[0]) return false;
      return this[0].classList.contains(className);
    }
    function toggleClass(className) {
      const classes = className.split(' ');
      for (let i = 0; i < classes.length; i += 1) {
        for (let j = 0; j < this.length; j += 1) {
          if (typeof this[j] !== 'undefined' && typeof this[j].classList !== 'undefined') this[j].classList.toggle(classes[i]);
        }
      }
      return this;
    }
    function attr$1(attrs, value) {
      if (arguments.length === 1 && typeof attrs === 'string') {
        // Get attr
        if (this[0]) return this[0].getAttribute(attrs);
        return undefined;
      }

      // Set attrs
      for (let i = 0; i < this.length; i += 1) {
        if (arguments.length === 2) {
          // String
          this[i].setAttribute(attrs, value);
        } else {
          // Object
          // eslint-disable-next-line
          for (const attrName in attrs) {
            this[i][attrName] = attrs[attrName];
            this[i].setAttribute(attrName, attrs[attrName]);
          }
        }
      }
      return this;
    }
    // eslint-disable-next-line
    function removeAttr(attr) {
      for (let i = 0; i < this.length; i += 1) {
        this[i].removeAttribute(attr);
      }
      return this;
    }
    function data(key, value) {
      let el;
      if (typeof value === 'undefined') {
        el = this[0];
        // Get value
        if (el) {
          if (el.dom7ElementDataStorage && (key in el.dom7ElementDataStorage)) {
            return el.dom7ElementDataStorage[key];
          }

          const dataKey = el.getAttribute(`data-${key}`);
          if (dataKey) {
            return dataKey;
          }
          return undefined;
        }
        return undefined;
      }

      // Set value
      for (let i = 0; i < this.length; i += 1) {
        el = this[i];
        if (!el.dom7ElementDataStorage) el.dom7ElementDataStorage = {};
        el.dom7ElementDataStorage[key] = value;
      }
      return this;
    }
    // Transforms
    // eslint-disable-next-line
    function transform(transform) {
      for (let i = 0; i < this.length; i += 1) {
        const elStyle = this[i].style;
        elStyle.webkitTransform = transform;
        elStyle.transform = transform;
      }
      return this;
    }
    function transition(duration) {
      if (typeof duration !== 'string') {
        duration = `${duration}ms`; // eslint-disable-line
      }
      for (let i = 0; i < this.length; i += 1) {
        const elStyle = this[i].style;
        elStyle.webkitTransitionDuration = duration;
        elStyle.transitionDuration = duration;
      }
      return this;
    }
    // Events
    function on(...args) {
      let [eventType, targetSelector, listener, capture] = args;
      if (typeof args[1] === 'function') {
        [eventType, listener, capture] = args;
        targetSelector = undefined;
      }
      if (!capture) capture = false;

      function handleLiveEvent(e) {
        const target = e.target;
        if (!target) return;
        const eventData = e.target.dom7EventData || [];
        if (eventData.indexOf(e) < 0) {
          eventData.unshift(e);
        }
        if ($(target).is(targetSelector)) listener.apply(target, eventData);
        else {
          const parents = $(target).parents(); // eslint-disable-line
          for (let k = 0; k < parents.length; k += 1) {
            if ($(parents[k]).is(targetSelector)) listener.apply(parents[k], eventData);
          }
        }
      }
      function handleEvent(e) {
        const eventData = e && e.target ? e.target.dom7EventData || [] : [];
        if (eventData.indexOf(e) < 0) {
          eventData.unshift(e);
        }
        listener.apply(this, eventData);
      }
      const events = eventType.split(' ');
      let j;
      for (let i = 0; i < this.length; i += 1) {
        const el = this[i];
        if (!targetSelector) {
          for (j = 0; j < events.length; j += 1) {
            const event = events[j];
            if (!el.dom7Listeners) el.dom7Listeners = {};
            if (!el.dom7Listeners[event]) el.dom7Listeners[event] = [];
            el.dom7Listeners[event].push({
              listener,
              proxyListener: handleEvent,
            });
            el.addEventListener(event, handleEvent, capture);
          }
        } else {
          // Live events
          for (j = 0; j < events.length; j += 1) {
            const event = events[j];
            if (!el.dom7LiveListeners) el.dom7LiveListeners = {};
            if (!el.dom7LiveListeners[event]) el.dom7LiveListeners[event] = [];
            el.dom7LiveListeners[event].push({
              listener,
              proxyListener: handleLiveEvent,
            });
            el.addEventListener(event, handleLiveEvent, capture);
          }
        }
      }
      return this;
    }
    function off(...args) {
      let [eventType, targetSelector, listener, capture] = args;
      if (typeof args[1] === 'function') {
        [eventType, listener, capture] = args;
        targetSelector = undefined;
      }
      if (!capture) capture = false;

      const events = eventType.split(' ');
      for (let i = 0; i < events.length; i += 1) {
        const event = events[i];
        for (let j = 0; j < this.length; j += 1) {
          const el = this[j];
          let handlers;
          if (!targetSelector && el.dom7Listeners) {
            handlers = el.dom7Listeners[event];
          } else if (targetSelector && el.dom7LiveListeners) {
            handlers = el.dom7LiveListeners[event];
          }
          if (handlers && handlers.length) {
            for (let k = handlers.length - 1; k >= 0; k -= 1) {
              const handler = handlers[k];
              if (listener && handler.listener === listener) {
                el.removeEventListener(event, handler.proxyListener, capture);
                handlers.splice(k, 1);
              } else if (listener && handler.listener && handler.listener.dom7proxy && handler.listener.dom7proxy === listener) {
                el.removeEventListener(event, handler.proxyListener, capture);
                handlers.splice(k, 1);
              } else if (!listener) {
                el.removeEventListener(event, handler.proxyListener, capture);
                handlers.splice(k, 1);
              }
            }
          }
        }
      }
      return this;
    }
    function trigger(...args) {
      const events = args[0].split(' ');
      const eventData = args[1];
      for (let i = 0; i < events.length; i += 1) {
        const event = events[i];
        for (let j = 0; j < this.length; j += 1) {
          const el = this[j];
          let evt;
          try {
            evt = new win.CustomEvent(event, {
              detail: eventData,
              bubbles: true,
              cancelable: true,
            });
          } catch (e) {
            evt = doc.createEvent('Event');
            evt.initEvent(event, true, true);
            evt.detail = eventData;
          }
          // eslint-disable-next-line
          el.dom7EventData = args.filter((data, dataIndex) => dataIndex > 0);
          el.dispatchEvent(evt);
          el.dom7EventData = [];
          delete el.dom7EventData;
        }
      }
      return this;
    }
    function transitionEnd(callback) {
      const events = ['webkitTransitionEnd', 'transitionend'];
      const dom = this;
      let i;
      function fireCallBack(e) {
        /* jshint validthis:true */
        if (e.target !== this) return;
        callback.call(this, e);
        for (i = 0; i < events.length; i += 1) {
          dom.off(events[i], fireCallBack);
        }
      }
      if (callback) {
        for (i = 0; i < events.length; i += 1) {
          dom.on(events[i], fireCallBack);
        }
      }
      return this;
    }
    function outerWidth(includeMargins) {
      if (this.length > 0) {
        if (includeMargins) {
          // eslint-disable-next-line
          const styles = this.styles();
          return this[0].offsetWidth + parseFloat(styles.getPropertyValue('margin-right')) + parseFloat(styles.getPropertyValue('margin-left'));
        }
        return this[0].offsetWidth;
      }
      return null;
    }
    function outerHeight(includeMargins) {
      if (this.length > 0) {
        if (includeMargins) {
          // eslint-disable-next-line
          const styles = this.styles();
          return this[0].offsetHeight + parseFloat(styles.getPropertyValue('margin-top')) + parseFloat(styles.getPropertyValue('margin-bottom'));
        }
        return this[0].offsetHeight;
      }
      return null;
    }
    function offset() {
      if (this.length > 0) {
        const el = this[0];
        const box = el.getBoundingClientRect();
        const body = doc.body;
        const clientTop = el.clientTop || body.clientTop || 0;
        const clientLeft = el.clientLeft || body.clientLeft || 0;
        const scrollTop = el === win ? win.scrollY : el.scrollTop;
        const scrollLeft = el === win ? win.scrollX : el.scrollLeft;
        return {
          top: (box.top + scrollTop) - clientTop,
          left: (box.left + scrollLeft) - clientLeft,
        };
      }

      return null;
    }
    function styles() {
      if (this[0]) return win.getComputedStyle(this[0], null);
      return {};
    }
    function css(props, value) {
      let i;
      if (arguments.length === 1) {
        if (typeof props === 'string') {
          if (this[0]) return win.getComputedStyle(this[0], null).getPropertyValue(props);
        } else {
          for (i = 0; i < this.length; i += 1) {
            // eslint-disable-next-line
            for (let prop in props) {
              this[i].style[prop] = props[prop];
            }
          }
          return this;
        }
      }
      if (arguments.length === 2 && typeof props === 'string') {
        for (i = 0; i < this.length; i += 1) {
          this[i].style[props] = value;
        }
        return this;
      }
      return this;
    }
    // Iterate over the collection passing elements to `callback`
    function each(callback) {
      // Don't bother continuing without a callback
      if (!callback) return this;
      // Iterate over the current collection
      for (let i = 0; i < this.length; i += 1) {
        // If the callback returns false
        if (callback.call(this[i], i, this[i]) === false) {
          // End the loop early
          return this;
        }
      }
      // Return `this` to allow chained DOM operations
      return this;
    }
    // eslint-disable-next-line
    function html(html) {
      if (typeof html === 'undefined') {
        return this[0] ? this[0].innerHTML : undefined;
      }

      for (let i = 0; i < this.length; i += 1) {
        this[i].innerHTML = html;
      }
      return this;
    }
    // eslint-disable-next-line
    function text$1(text) {
      if (typeof text === 'undefined') {
        if (this[0]) {
          return this[0].textContent.trim();
        }
        return null;
      }

      for (let i = 0; i < this.length; i += 1) {
        this[i].textContent = text;
      }
      return this;
    }
    function is(selector) {
      const el = this[0];
      let compareWith;
      let i;
      if (!el || typeof selector === 'undefined') return false;
      if (typeof selector === 'string') {
        if (el.matches) return el.matches(selector);
        else if (el.webkitMatchesSelector) return el.webkitMatchesSelector(selector);
        else if (el.msMatchesSelector) return el.msMatchesSelector(selector);

        compareWith = $(selector);
        for (i = 0; i < compareWith.length; i += 1) {
          if (compareWith[i] === el) return true;
        }
        return false;
      } else if (selector === doc) return el === doc;
      else if (selector === win) return el === win;

      if (selector.nodeType || selector instanceof Dom7) {
        compareWith = selector.nodeType ? [selector] : selector;
        for (i = 0; i < compareWith.length; i += 1) {
          if (compareWith[i] === el) return true;
        }
        return false;
      }
      return false;
    }
    function index() {
      let child = this[0];
      let i;
      if (child) {
        i = 0;
        // eslint-disable-next-line
        while ((child = child.previousSibling) !== null) {
          if (child.nodeType === 1) i += 1;
        }
        return i;
      }
      return undefined;
    }
    // eslint-disable-next-line
    function eq(index) {
      if (typeof index === 'undefined') return this;
      const length = this.length;
      let returnIndex;
      if (index > length - 1) {
        return new Dom7([]);
      }
      if (index < 0) {
        returnIndex = length + index;
        if (returnIndex < 0) return new Dom7([]);
        return new Dom7([this[returnIndex]]);
      }
      return new Dom7([this[index]]);
    }
    function append$1(...args) {
      let newChild;

      for (let k = 0; k < args.length; k += 1) {
        newChild = args[k];
        for (let i = 0; i < this.length; i += 1) {
          if (typeof newChild === 'string') {
            const tempDiv = doc.createElement('div');
            tempDiv.innerHTML = newChild;
            while (tempDiv.firstChild) {
              this[i].appendChild(tempDiv.firstChild);
            }
          } else if (newChild instanceof Dom7) {
            for (let j = 0; j < newChild.length; j += 1) {
              this[i].appendChild(newChild[j]);
            }
          } else {
            this[i].appendChild(newChild);
          }
        }
      }

      return this;
    }
    function prepend(newChild) {
      let i;
      let j;
      for (i = 0; i < this.length; i += 1) {
        if (typeof newChild === 'string') {
          const tempDiv = doc.createElement('div');
          tempDiv.innerHTML = newChild;
          for (j = tempDiv.childNodes.length - 1; j >= 0; j -= 1) {
            this[i].insertBefore(tempDiv.childNodes[j], this[i].childNodes[0]);
          }
        } else if (newChild instanceof Dom7) {
          for (j = 0; j < newChild.length; j += 1) {
            this[i].insertBefore(newChild[j], this[i].childNodes[0]);
          }
        } else {
          this[i].insertBefore(newChild, this[i].childNodes[0]);
        }
      }
      return this;
    }
    function next(selector) {
      if (this.length > 0) {
        if (selector) {
          if (this[0].nextElementSibling && $(this[0].nextElementSibling).is(selector)) {
            return new Dom7([this[0].nextElementSibling]);
          }
          return new Dom7([]);
        }

        if (this[0].nextElementSibling) return new Dom7([this[0].nextElementSibling]);
        return new Dom7([]);
      }
      return new Dom7([]);
    }
    function nextAll(selector) {
      const nextEls = [];
      let el = this[0];
      if (!el) return new Dom7([]);
      while (el.nextElementSibling) {
        const next = el.nextElementSibling; // eslint-disable-line
        if (selector) {
          if ($(next).is(selector)) nextEls.push(next);
        } else nextEls.push(next);
        el = next;
      }
      return new Dom7(nextEls);
    }
    function prev(selector) {
      if (this.length > 0) {
        const el = this[0];
        if (selector) {
          if (el.previousElementSibling && $(el.previousElementSibling).is(selector)) {
            return new Dom7([el.previousElementSibling]);
          }
          return new Dom7([]);
        }

        if (el.previousElementSibling) return new Dom7([el.previousElementSibling]);
        return new Dom7([]);
      }
      return new Dom7([]);
    }
    function prevAll(selector) {
      const prevEls = [];
      let el = this[0];
      if (!el) return new Dom7([]);
      while (el.previousElementSibling) {
        const prev = el.previousElementSibling; // eslint-disable-line
        if (selector) {
          if ($(prev).is(selector)) prevEls.push(prev);
        } else prevEls.push(prev);
        el = prev;
      }
      return new Dom7(prevEls);
    }
    function parent(selector) {
      const parents = []; // eslint-disable-line
      for (let i = 0; i < this.length; i += 1) {
        if (this[i].parentNode !== null) {
          if (selector) {
            if ($(this[i].parentNode).is(selector)) parents.push(this[i].parentNode);
          } else {
            parents.push(this[i].parentNode);
          }
        }
      }
      return $(unique(parents));
    }
    function parents(selector) {
      const parents = []; // eslint-disable-line
      for (let i = 0; i < this.length; i += 1) {
        let parent = this[i].parentNode; // eslint-disable-line
        while (parent) {
          if (selector) {
            if ($(parent).is(selector)) parents.push(parent);
          } else {
            parents.push(parent);
          }
          parent = parent.parentNode;
        }
      }
      return $(unique(parents));
    }
    function closest(selector) {
      let closest = this; // eslint-disable-line
      if (typeof selector === 'undefined') {
        return new Dom7([]);
      }
      if (!closest.is(selector)) {
        closest = closest.parents(selector).eq(0);
      }
      return closest;
    }
    function find(selector) {
      const foundElements = [];
      for (let i = 0; i < this.length; i += 1) {
        const found = this[i].querySelectorAll(selector);
        for (let j = 0; j < found.length; j += 1) {
          foundElements.push(found[j]);
        }
      }
      return new Dom7(foundElements);
    }
    function children$1(selector) {
      const children = []; // eslint-disable-line
      for (let i = 0; i < this.length; i += 1) {
        const childNodes = this[i].childNodes;

        for (let j = 0; j < childNodes.length; j += 1) {
          if (!selector) {
            if (childNodes[j].nodeType === 1) children.push(childNodes[j]);
          } else if (childNodes[j].nodeType === 1 && $(childNodes[j]).is(selector)) {
            children.push(childNodes[j]);
          }
        }
      }
      return new Dom7(unique(children));
    }
    function remove() {
      for (let i = 0; i < this.length; i += 1) {
        if (this[i].parentNode) this[i].parentNode.removeChild(this[i]);
      }
      return this;
    }
    function add(...args) {
      const dom = this;
      let i;
      let j;
      for (i = 0; i < args.length; i += 1) {
        const toAdd = $(args[i]);
        for (j = 0; j < toAdd.length; j += 1) {
          dom[dom.length] = toAdd[j];
          dom.length += 1;
        }
      }
      return dom;
    }

    /**
     * Swiper 4.5.1
     * Most modern mobile touch slider and framework with hardware accelerated transitions
     * http://www.idangero.us/swiper/
     *
     * Copyright 2014-2019 Vladimir Kharlampidi
     *
     * Released under the MIT License
     *
     * Released on: September 13, 2019
     */

    const Methods = {
      addClass,
      removeClass,
      hasClass,
      toggleClass,
      attr: attr$1,
      removeAttr,
      data,
      transform,
      transition: transition,
      on,
      off,
      trigger,
      transitionEnd: transitionEnd,
      outerWidth,
      outerHeight,
      offset,
      css,
      each,
      html,
      text: text$1,
      is,
      index,
      eq,
      append: append$1,
      prepend,
      next,
      nextAll,
      prev,
      prevAll,
      parent,
      parents,
      closest,
      find,
      children: children$1,
      remove,
      add,
      styles,
    };

    Object.keys(Methods).forEach((methodName) => {
      $.fn[methodName] = $.fn[methodName] || Methods[methodName];
    });

    const Utils = {
      deleteProps(obj) {
        const object = obj;
        Object.keys(object).forEach((key) => {
          try {
            object[key] = null;
          } catch (e) {
            // no getter for object
          }
          try {
            delete object[key];
          } catch (e) {
            // something got wrong
          }
        });
      },
      nextTick(callback, delay = 0) {
        return setTimeout(callback, delay);
      },
      now() {
        return Date.now();
      },
      getTranslate(el, axis = 'x') {
        let matrix;
        let curTransform;
        let transformMatrix;

        const curStyle = win.getComputedStyle(el, null);

        if (win.WebKitCSSMatrix) {
          curTransform = curStyle.transform || curStyle.webkitTransform;
          if (curTransform.split(',').length > 6) {
            curTransform = curTransform.split(', ').map((a) => a.replace(',', '.')).join(', ');
          }
          // Some old versions of Webkit choke when 'none' is passed; pass
          // empty string instead in this case
          transformMatrix = new win.WebKitCSSMatrix(curTransform === 'none' ? '' : curTransform);
        } else {
          transformMatrix = curStyle.MozTransform || curStyle.OTransform || curStyle.MsTransform || curStyle.msTransform || curStyle.transform || curStyle.getPropertyValue('transform').replace('translate(', 'matrix(1, 0, 0, 1,');
          matrix = transformMatrix.toString().split(',');
        }

        if (axis === 'x') {
          // Latest Chrome and webkits Fix
          if (win.WebKitCSSMatrix) curTransform = transformMatrix.m41;
          // Crazy IE10 Matrix
          else if (matrix.length === 16) curTransform = parseFloat(matrix[12]);
          // Normal Browsers
          else curTransform = parseFloat(matrix[4]);
        }
        if (axis === 'y') {
          // Latest Chrome and webkits Fix
          if (win.WebKitCSSMatrix) curTransform = transformMatrix.m42;
          // Crazy IE10 Matrix
          else if (matrix.length === 16) curTransform = parseFloat(matrix[13]);
          // Normal Browsers
          else curTransform = parseFloat(matrix[5]);
        }
        return curTransform || 0;
      },
      parseUrlQuery(url) {
        const query = {};
        let urlToParse = url || win.location.href;
        let i;
        let params;
        let param;
        let length;
        if (typeof urlToParse === 'string' && urlToParse.length) {
          urlToParse = urlToParse.indexOf('?') > -1 ? urlToParse.replace(/\S*\?/, '') : '';
          params = urlToParse.split('&').filter((paramsPart) => paramsPart !== '');
          length = params.length;

          for (i = 0; i < length; i += 1) {
            param = params[i].replace(/#\S+/g, '').split('=');
            query[decodeURIComponent(param[0])] = typeof param[1] === 'undefined' ? undefined : decodeURIComponent(param[1]) || '';
          }
        }
        return query;
      },
      isObject(o) {
        return typeof o === 'object' && o !== null && o.constructor && o.constructor === Object;
      },
      extend(...args) {
        const to = Object(args[0]);
        for (let i = 1; i < args.length; i += 1) {
          const nextSource = args[i];
          if (nextSource !== undefined && nextSource !== null) {
            const keysArray = Object.keys(Object(nextSource));
            for (let nextIndex = 0, len = keysArray.length; nextIndex < len; nextIndex += 1) {
              const nextKey = keysArray[nextIndex];
              const desc = Object.getOwnPropertyDescriptor(nextSource, nextKey);
              if (desc !== undefined && desc.enumerable) {
                if (Utils.isObject(to[nextKey]) && Utils.isObject(nextSource[nextKey])) {
                  Utils.extend(to[nextKey], nextSource[nextKey]);
                } else if (!Utils.isObject(to[nextKey]) && Utils.isObject(nextSource[nextKey])) {
                  to[nextKey] = {};
                  Utils.extend(to[nextKey], nextSource[nextKey]);
                } else {
                  to[nextKey] = nextSource[nextKey];
                }
              }
            }
          }
        }
        return to;
      },
    };

    const Support = (function Support() {
      const testDiv = doc.createElement('div');
      return {
        touch: (win.Modernizr && win.Modernizr.touch === true) || (function checkTouch() {
          return !!((win.navigator.maxTouchPoints > 0) || ('ontouchstart' in win) || (win.DocumentTouch && doc instanceof win.DocumentTouch));
        }()),

        pointerEvents: !!(win.navigator.pointerEnabled || win.PointerEvent || ('maxTouchPoints' in win.navigator && win.navigator.maxTouchPoints > 0)),
        prefixedPointerEvents: !!win.navigator.msPointerEnabled,

        transition: (function checkTransition() {
          const style = testDiv.style;
          return ('transition' in style || 'webkitTransition' in style || 'MozTransition' in style);
        }()),
        transforms3d: (win.Modernizr && win.Modernizr.csstransforms3d === true) || (function checkTransforms3d() {
          const style = testDiv.style;
          return ('webkitPerspective' in style || 'MozPerspective' in style || 'OPerspective' in style || 'MsPerspective' in style || 'perspective' in style);
        }()),

        flexbox: (function checkFlexbox() {
          const style = testDiv.style;
          const styles = ('alignItems webkitAlignItems webkitBoxAlign msFlexAlign mozBoxAlign webkitFlexDirection msFlexDirection mozBoxDirection mozBoxOrient webkitBoxDirection webkitBoxOrient').split(' ');
          for (let i = 0; i < styles.length; i += 1) {
            if (styles[i] in style) return true;
          }
          return false;
        }()),

        observer: (function checkObserver() {
          return ('MutationObserver' in win || 'WebkitMutationObserver' in win);
        }()),

        passiveListener: (function checkPassiveListener() {
          let supportsPassive = false;
          try {
            const opts = Object.defineProperty({}, 'passive', {
              // eslint-disable-next-line
              get() {
                supportsPassive = true;
              },
            });
            win.addEventListener('testPassiveListener', null, opts);
          } catch (e) {
            // No support
          }
          return supportsPassive;
        }()),

        gestures: (function checkGestures() {
          return 'ongesturestart' in win;
        }()),
      };
    }());

    const Browser = (function Browser() {
      function isSafari() {
        const ua = win.navigator.userAgent.toLowerCase();
        return (ua.indexOf('safari') >= 0 && ua.indexOf('chrome') < 0 && ua.indexOf('android') < 0);
      }
      return {
        isIE: !!win.navigator.userAgent.match(/Trident/g) || !!win.navigator.userAgent.match(/MSIE/g),
        isEdge: !!win.navigator.userAgent.match(/Edge/g),
        isSafari: isSafari(),
        isUiWebView: /(iPhone|iPod|iPad).*AppleWebKit(?!.*Safari)/i.test(win.navigator.userAgent),
      };
    }());

    class SwiperClass {
      constructor(params = {}) {
        const self = this;
        self.params = params;

        // Events
        self.eventsListeners = {};

        if (self.params && self.params.on) {
          Object.keys(self.params.on).forEach((eventName) => {
            self.on(eventName, self.params.on[eventName]);
          });
        }
      }

      on(events, handler, priority) {
        const self = this;
        if (typeof handler !== 'function') return self;
        const method = priority ? 'unshift' : 'push';
        events.split(' ').forEach((event) => {
          if (!self.eventsListeners[event]) self.eventsListeners[event] = [];
          self.eventsListeners[event][method](handler);
        });
        return self;
      }

      once(events, handler, priority) {
        const self = this;
        if (typeof handler !== 'function') return self;
        function onceHandler(...args) {
          handler.apply(self, args);
          self.off(events, onceHandler);
          if (onceHandler.f7proxy) {
            delete onceHandler.f7proxy;
          }
        }
        onceHandler.f7proxy = handler;
        return self.on(events, onceHandler, priority);
      }

      off(events, handler) {
        const self = this;
        if (!self.eventsListeners) return self;
        events.split(' ').forEach((event) => {
          if (typeof handler === 'undefined') {
            self.eventsListeners[event] = [];
          } else if (self.eventsListeners[event] && self.eventsListeners[event].length) {
            self.eventsListeners[event].forEach((eventHandler, index) => {
              if (eventHandler === handler || (eventHandler.f7proxy && eventHandler.f7proxy === handler)) {
                self.eventsListeners[event].splice(index, 1);
              }
            });
          }
        });
        return self;
      }

      emit(...args) {
        const self = this;
        if (!self.eventsListeners) return self;
        let events;
        let data;
        let context;
        if (typeof args[0] === 'string' || Array.isArray(args[0])) {
          events = args[0];
          data = args.slice(1, args.length);
          context = self;
        } else {
          events = args[0].events;
          data = args[0].data;
          context = args[0].context || self;
        }
        const eventsArray = Array.isArray(events) ? events : events.split(' ');
        eventsArray.forEach((event) => {
          if (self.eventsListeners && self.eventsListeners[event]) {
            const handlers = [];
            self.eventsListeners[event].forEach((eventHandler) => {
              handlers.push(eventHandler);
            });
            handlers.forEach((eventHandler) => {
              eventHandler.apply(context, data);
            });
          }
        });
        return self;
      }

      useModulesParams(instanceParams) {
        const instance = this;
        if (!instance.modules) return;
        Object.keys(instance.modules).forEach((moduleName) => {
          const module = instance.modules[moduleName];
          // Extend params
          if (module.params) {
            Utils.extend(instanceParams, module.params);
          }
        });
      }

      useModules(modulesParams = {}) {
        const instance = this;
        if (!instance.modules) return;
        Object.keys(instance.modules).forEach((moduleName) => {
          const module = instance.modules[moduleName];
          const moduleParams = modulesParams[moduleName] || {};
          // Extend instance methods and props
          if (module.instance) {
            Object.keys(module.instance).forEach((modulePropName) => {
              const moduleProp = module.instance[modulePropName];
              if (typeof moduleProp === 'function') {
                instance[modulePropName] = moduleProp.bind(instance);
              } else {
                instance[modulePropName] = moduleProp;
              }
            });
          }
          // Add event listeners
          if (module.on && instance.on) {
            Object.keys(module.on).forEach((moduleEventName) => {
              instance.on(moduleEventName, module.on[moduleEventName]);
            });
          }

          // Module create callback
          if (module.create) {
            module.create.bind(instance)(moduleParams);
          }
        });
      }

      static set components(components) {
        const Class = this;
        if (!Class.use) return;
        Class.use(components);
      }

      static installModule(module, ...params) {
        const Class = this;
        if (!Class.prototype.modules) Class.prototype.modules = {};
        const name = module.name || (`${Object.keys(Class.prototype.modules).length}_${Utils.now()}`);
        Class.prototype.modules[name] = module;
        // Prototype
        if (module.proto) {
          Object.keys(module.proto).forEach((key) => {
            Class.prototype[key] = module.proto[key];
          });
        }
        // Class
        if (module.static) {
          Object.keys(module.static).forEach((key) => {
            Class[key] = module.static[key];
          });
        }
        // Callback
        if (module.install) {
          module.install.apply(Class, params);
        }
        return Class;
      }

      static use(module, ...params) {
        const Class = this;
        if (Array.isArray(module)) {
          module.forEach((m) => Class.installModule(m));
          return Class;
        }
        return Class.installModule(module, ...params);
      }
    }

    function updateSize () {
      const swiper = this;
      let width;
      let height;
      const $el = swiper.$el;
      if (typeof swiper.params.width !== 'undefined') {
        width = swiper.params.width;
      } else {
        width = $el[0].clientWidth;
      }
      if (typeof swiper.params.height !== 'undefined') {
        height = swiper.params.height;
      } else {
        height = $el[0].clientHeight;
      }
      if ((width === 0 && swiper.isHorizontal()) || (height === 0 && swiper.isVertical())) {
        return;
      }

      // Subtract paddings
      width = width - parseInt($el.css('padding-left'), 10) - parseInt($el.css('padding-right'), 10);
      height = height - parseInt($el.css('padding-top'), 10) - parseInt($el.css('padding-bottom'), 10);

      Utils.extend(swiper, {
        width,
        height,
        size: swiper.isHorizontal() ? width : height,
      });
    }

    function updateSlides () {
      const swiper = this;
      const params = swiper.params;

      const {
        $wrapperEl, size: swiperSize, rtlTranslate: rtl, wrongRTL,
      } = swiper;
      const isVirtual = swiper.virtual && params.virtual.enabled;
      const previousSlidesLength = isVirtual ? swiper.virtual.slides.length : swiper.slides.length;
      const slides = $wrapperEl.children(`.${swiper.params.slideClass}`);
      const slidesLength = isVirtual ? swiper.virtual.slides.length : slides.length;
      let snapGrid = [];
      const slidesGrid = [];
      const slidesSizesGrid = [];

      let offsetBefore = params.slidesOffsetBefore;
      if (typeof offsetBefore === 'function') {
        offsetBefore = params.slidesOffsetBefore.call(swiper);
      }

      let offsetAfter = params.slidesOffsetAfter;
      if (typeof offsetAfter === 'function') {
        offsetAfter = params.slidesOffsetAfter.call(swiper);
      }

      const previousSnapGridLength = swiper.snapGrid.length;
      const previousSlidesGridLength = swiper.snapGrid.length;

      let spaceBetween = params.spaceBetween;
      let slidePosition = -offsetBefore;
      let prevSlideSize = 0;
      let index = 0;
      if (typeof swiperSize === 'undefined') {
        return;
      }
      if (typeof spaceBetween === 'string' && spaceBetween.indexOf('%') >= 0) {
        spaceBetween = (parseFloat(spaceBetween.replace('%', '')) / 100) * swiperSize;
      }

      swiper.virtualSize = -spaceBetween;

      // reset margins
      if (rtl) slides.css({ marginLeft: '', marginTop: '' });
      else slides.css({ marginRight: '', marginBottom: '' });

      let slidesNumberEvenToRows;
      if (params.slidesPerColumn > 1) {
        if (Math.floor(slidesLength / params.slidesPerColumn) === slidesLength / swiper.params.slidesPerColumn) {
          slidesNumberEvenToRows = slidesLength;
        } else {
          slidesNumberEvenToRows = Math.ceil(slidesLength / params.slidesPerColumn) * params.slidesPerColumn;
        }
        if (params.slidesPerView !== 'auto' && params.slidesPerColumnFill === 'row') {
          slidesNumberEvenToRows = Math.max(slidesNumberEvenToRows, params.slidesPerView * params.slidesPerColumn);
        }
      }

      // Calc slides
      let slideSize;
      const slidesPerColumn = params.slidesPerColumn;
      const slidesPerRow = slidesNumberEvenToRows / slidesPerColumn;
      const numFullColumns = Math.floor(slidesLength / params.slidesPerColumn);
      for (let i = 0; i < slidesLength; i += 1) {
        slideSize = 0;
        const slide = slides.eq(i);
        if (params.slidesPerColumn > 1) {
          // Set slides order
          let newSlideOrderIndex;
          let column;
          let row;
          if (
            (params.slidesPerColumnFill === 'column')
            || (params.slidesPerColumnFill === 'row' && params.slidesPerGroup > 1)
          ) {
            if (params.slidesPerColumnFill === 'column') {
              column = Math.floor(i / slidesPerColumn);
              row = i - (column * slidesPerColumn);
              if (column > numFullColumns || (column === numFullColumns && row === slidesPerColumn - 1)) {
                row += 1;
                if (row >= slidesPerColumn) {
                  row = 0;
                  column += 1;
                }
              }
            } else {
              const groupIndex = Math.floor(i / params.slidesPerGroup);
              row = Math.floor(i / params.slidesPerView) - groupIndex * params.slidesPerColumn;
              column = i - row * params.slidesPerView - groupIndex * params.slidesPerView;
            }
            newSlideOrderIndex = column + ((row * slidesNumberEvenToRows) / slidesPerColumn);
            slide
              .css({
                '-webkit-box-ordinal-group': newSlideOrderIndex,
                '-moz-box-ordinal-group': newSlideOrderIndex,
                '-ms-flex-order': newSlideOrderIndex,
                '-webkit-order': newSlideOrderIndex,
                order: newSlideOrderIndex,
              });
          } else {
            row = Math.floor(i / slidesPerRow);
            column = i - (row * slidesPerRow);
          }
          slide
            .css(
              `margin-${swiper.isHorizontal() ? 'top' : 'left'}`,
              (row !== 0 && params.spaceBetween) && (`${params.spaceBetween}px`)
            )
            .attr('data-swiper-column', column)
            .attr('data-swiper-row', row);
        }
        if (slide.css('display') === 'none') continue; // eslint-disable-line

        if (params.slidesPerView === 'auto') {
          const slideStyles = win.getComputedStyle(slide[0], null);
          const currentTransform = slide[0].style.transform;
          const currentWebKitTransform = slide[0].style.webkitTransform;
          if (currentTransform) {
            slide[0].style.transform = 'none';
          }
          if (currentWebKitTransform) {
            slide[0].style.webkitTransform = 'none';
          }
          if (params.roundLengths) {
            slideSize = swiper.isHorizontal()
              ? slide.outerWidth(true)
              : slide.outerHeight(true);
          } else {
            // eslint-disable-next-line
            if (swiper.isHorizontal()) {
              const width = parseFloat(slideStyles.getPropertyValue('width'));
              const paddingLeft = parseFloat(slideStyles.getPropertyValue('padding-left'));
              const paddingRight = parseFloat(slideStyles.getPropertyValue('padding-right'));
              const marginLeft = parseFloat(slideStyles.getPropertyValue('margin-left'));
              const marginRight = parseFloat(slideStyles.getPropertyValue('margin-right'));
              const boxSizing = slideStyles.getPropertyValue('box-sizing');
              if (boxSizing && boxSizing === 'border-box' && !Browser.isIE) {
                slideSize = width + marginLeft + marginRight;
              } else {
                slideSize = width + paddingLeft + paddingRight + marginLeft + marginRight;
              }
            } else {
              const height = parseFloat(slideStyles.getPropertyValue('height'));
              const paddingTop = parseFloat(slideStyles.getPropertyValue('padding-top'));
              const paddingBottom = parseFloat(slideStyles.getPropertyValue('padding-bottom'));
              const marginTop = parseFloat(slideStyles.getPropertyValue('margin-top'));
              const marginBottom = parseFloat(slideStyles.getPropertyValue('margin-bottom'));
              const boxSizing = slideStyles.getPropertyValue('box-sizing');
              if (boxSizing && boxSizing === 'border-box' && !Browser.isIE) {
                slideSize = height + marginTop + marginBottom;
              } else {
                slideSize = height + paddingTop + paddingBottom + marginTop + marginBottom;
              }
            }
          }
          if (currentTransform) {
            slide[0].style.transform = currentTransform;
          }
          if (currentWebKitTransform) {
            slide[0].style.webkitTransform = currentWebKitTransform;
          }
          if (params.roundLengths) slideSize = Math.floor(slideSize);
        } else {
          slideSize = (swiperSize - ((params.slidesPerView - 1) * spaceBetween)) / params.slidesPerView;
          if (params.roundLengths) slideSize = Math.floor(slideSize);

          if (slides[i]) {
            if (swiper.isHorizontal()) {
              slides[i].style.width = `${slideSize}px`;
            } else {
              slides[i].style.height = `${slideSize}px`;
            }
          }
        }
        if (slides[i]) {
          slides[i].swiperSlideSize = slideSize;
        }
        slidesSizesGrid.push(slideSize);


        if (params.centeredSlides) {
          slidePosition = slidePosition + (slideSize / 2) + (prevSlideSize / 2) + spaceBetween;
          if (prevSlideSize === 0 && i !== 0) slidePosition = slidePosition - (swiperSize / 2) - spaceBetween;
          if (i === 0) slidePosition = slidePosition - (swiperSize / 2) - spaceBetween;
          if (Math.abs(slidePosition) < 1 / 1000) slidePosition = 0;
          if (params.roundLengths) slidePosition = Math.floor(slidePosition);
          if ((index) % params.slidesPerGroup === 0) snapGrid.push(slidePosition);
          slidesGrid.push(slidePosition);
        } else {
          if (params.roundLengths) slidePosition = Math.floor(slidePosition);
          if ((index) % params.slidesPerGroup === 0) snapGrid.push(slidePosition);
          slidesGrid.push(slidePosition);
          slidePosition = slidePosition + slideSize + spaceBetween;
        }

        swiper.virtualSize += slideSize + spaceBetween;

        prevSlideSize = slideSize;

        index += 1;
      }
      swiper.virtualSize = Math.max(swiper.virtualSize, swiperSize) + offsetAfter;
      let newSlidesGrid;

      if (
        rtl && wrongRTL && (params.effect === 'slide' || params.effect === 'coverflow')) {
        $wrapperEl.css({ width: `${swiper.virtualSize + params.spaceBetween}px` });
      }
      if (!Support.flexbox || params.setWrapperSize) {
        if (swiper.isHorizontal()) $wrapperEl.css({ width: `${swiper.virtualSize + params.spaceBetween}px` });
        else $wrapperEl.css({ height: `${swiper.virtualSize + params.spaceBetween}px` });
      }

      if (params.slidesPerColumn > 1) {
        swiper.virtualSize = (slideSize + params.spaceBetween) * slidesNumberEvenToRows;
        swiper.virtualSize = Math.ceil(swiper.virtualSize / params.slidesPerColumn) - params.spaceBetween;
        if (swiper.isHorizontal()) $wrapperEl.css({ width: `${swiper.virtualSize + params.spaceBetween}px` });
        else $wrapperEl.css({ height: `${swiper.virtualSize + params.spaceBetween}px` });
        if (params.centeredSlides) {
          newSlidesGrid = [];
          for (let i = 0; i < snapGrid.length; i += 1) {
            let slidesGridItem = snapGrid[i];
            if (params.roundLengths) slidesGridItem = Math.floor(slidesGridItem);
            if (snapGrid[i] < swiper.virtualSize + snapGrid[0]) newSlidesGrid.push(slidesGridItem);
          }
          snapGrid = newSlidesGrid;
        }
      }

      // Remove last grid elements depending on width
      if (!params.centeredSlides) {
        newSlidesGrid = [];
        for (let i = 0; i < snapGrid.length; i += 1) {
          let slidesGridItem = snapGrid[i];
          if (params.roundLengths) slidesGridItem = Math.floor(slidesGridItem);
          if (snapGrid[i] <= swiper.virtualSize - swiperSize) {
            newSlidesGrid.push(slidesGridItem);
          }
        }
        snapGrid = newSlidesGrid;
        if (Math.floor(swiper.virtualSize - swiperSize) - Math.floor(snapGrid[snapGrid.length - 1]) > 1) {
          snapGrid.push(swiper.virtualSize - swiperSize);
        }
      }
      if (snapGrid.length === 0) snapGrid = [0];

      if (params.spaceBetween !== 0) {
        if (swiper.isHorizontal()) {
          if (rtl) slides.css({ marginLeft: `${spaceBetween}px` });
          else slides.css({ marginRight: `${spaceBetween}px` });
        } else slides.css({ marginBottom: `${spaceBetween}px` });
      }

      if (params.centerInsufficientSlides) {
        let allSlidesSize = 0;
        slidesSizesGrid.forEach((slideSizeValue) => {
          allSlidesSize += slideSizeValue + (params.spaceBetween ? params.spaceBetween : 0);
        });
        allSlidesSize -= params.spaceBetween;
        if (allSlidesSize < swiperSize) {
          const allSlidesOffset = (swiperSize - allSlidesSize) / 2;
          snapGrid.forEach((snap, snapIndex) => {
            snapGrid[snapIndex] = snap - allSlidesOffset;
          });
          slidesGrid.forEach((snap, snapIndex) => {
            slidesGrid[snapIndex] = snap + allSlidesOffset;
          });
        }
      }

      Utils.extend(swiper, {
        slides,
        snapGrid,
        slidesGrid,
        slidesSizesGrid,
      });

      if (slidesLength !== previousSlidesLength) {
        swiper.emit('slidesLengthChange');
      }
      if (snapGrid.length !== previousSnapGridLength) {
        if (swiper.params.watchOverflow) swiper.checkOverflow();
        swiper.emit('snapGridLengthChange');
      }
      if (slidesGrid.length !== previousSlidesGridLength) {
        swiper.emit('slidesGridLengthChange');
      }

      if (params.watchSlidesProgress || params.watchSlidesVisibility) {
        swiper.updateSlidesOffset();
      }
    }

    function updateAutoHeight (speed) {
      const swiper = this;
      const activeSlides = [];
      let newHeight = 0;
      let i;
      if (typeof speed === 'number') {
        swiper.setTransition(speed);
      } else if (speed === true) {
        swiper.setTransition(swiper.params.speed);
      }
      // Find slides currently in view
      if (swiper.params.slidesPerView !== 'auto' && swiper.params.slidesPerView > 1) {
        for (i = 0; i < Math.ceil(swiper.params.slidesPerView); i += 1) {
          const index = swiper.activeIndex + i;
          if (index > swiper.slides.length) break;
          activeSlides.push(swiper.slides.eq(index)[0]);
        }
      } else {
        activeSlides.push(swiper.slides.eq(swiper.activeIndex)[0]);
      }

      // Find new height from highest slide in view
      for (i = 0; i < activeSlides.length; i += 1) {
        if (typeof activeSlides[i] !== 'undefined') {
          const height = activeSlides[i].offsetHeight;
          newHeight = height > newHeight ? height : newHeight;
        }
      }

      // Update Height
      if (newHeight) swiper.$wrapperEl.css('height', `${newHeight}px`);
    }

    function updateSlidesOffset () {
      const swiper = this;
      const slides = swiper.slides;
      for (let i = 0; i < slides.length; i += 1) {
        slides[i].swiperSlideOffset = swiper.isHorizontal() ? slides[i].offsetLeft : slides[i].offsetTop;
      }
    }

    function updateSlidesProgress (translate = (this && this.translate) || 0) {
      const swiper = this;
      const params = swiper.params;

      const { slides, rtlTranslate: rtl } = swiper;

      if (slides.length === 0) return;
      if (typeof slides[0].swiperSlideOffset === 'undefined') swiper.updateSlidesOffset();

      let offsetCenter = -translate;
      if (rtl) offsetCenter = translate;

      // Visible Slides
      slides.removeClass(params.slideVisibleClass);

      swiper.visibleSlidesIndexes = [];
      swiper.visibleSlides = [];

      for (let i = 0; i < slides.length; i += 1) {
        const slide = slides[i];
        const slideProgress = (
          (offsetCenter + (params.centeredSlides ? swiper.minTranslate() : 0)) - slide.swiperSlideOffset
        ) / (slide.swiperSlideSize + params.spaceBetween);
        if (params.watchSlidesVisibility) {
          const slideBefore = -(offsetCenter - slide.swiperSlideOffset);
          const slideAfter = slideBefore + swiper.slidesSizesGrid[i];
          const isVisible = (slideBefore >= 0 && slideBefore < swiper.size - 1)
                    || (slideAfter > 1 && slideAfter <= swiper.size)
                    || (slideBefore <= 0 && slideAfter >= swiper.size);
          if (isVisible) {
            swiper.visibleSlides.push(slide);
            swiper.visibleSlidesIndexes.push(i);
            slides.eq(i).addClass(params.slideVisibleClass);
          }
        }
        slide.progress = rtl ? -slideProgress : slideProgress;
      }
      swiper.visibleSlides = $(swiper.visibleSlides);
    }

    function updateProgress (translate = (this && this.translate) || 0) {
      const swiper = this;
      const params = swiper.params;

      const translatesDiff = swiper.maxTranslate() - swiper.minTranslate();
      let { progress, isBeginning, isEnd } = swiper;
      const wasBeginning = isBeginning;
      const wasEnd = isEnd;
      if (translatesDiff === 0) {
        progress = 0;
        isBeginning = true;
        isEnd = true;
      } else {
        progress = (translate - swiper.minTranslate()) / (translatesDiff);
        isBeginning = progress <= 0;
        isEnd = progress >= 1;
      }
      Utils.extend(swiper, {
        progress,
        isBeginning,
        isEnd,
      });

      if (params.watchSlidesProgress || params.watchSlidesVisibility) swiper.updateSlidesProgress(translate);

      if (isBeginning && !wasBeginning) {
        swiper.emit('reachBeginning toEdge');
      }
      if (isEnd && !wasEnd) {
        swiper.emit('reachEnd toEdge');
      }
      if ((wasBeginning && !isBeginning) || (wasEnd && !isEnd)) {
        swiper.emit('fromEdge');
      }

      swiper.emit('progress', progress);
    }

    function updateSlidesClasses () {
      const swiper = this;

      const {
        slides, params, $wrapperEl, activeIndex, realIndex,
      } = swiper;
      const isVirtual = swiper.virtual && params.virtual.enabled;

      slides.removeClass(`${params.slideActiveClass} ${params.slideNextClass} ${params.slidePrevClass} ${params.slideDuplicateActiveClass} ${params.slideDuplicateNextClass} ${params.slideDuplicatePrevClass}`);

      let activeSlide;
      if (isVirtual) {
        activeSlide = swiper.$wrapperEl.find(`.${params.slideClass}[data-swiper-slide-index="${activeIndex}"]`);
      } else {
        activeSlide = slides.eq(activeIndex);
      }

      // Active classes
      activeSlide.addClass(params.slideActiveClass);

      if (params.loop) {
        // Duplicate to all looped slides
        if (activeSlide.hasClass(params.slideDuplicateClass)) {
          $wrapperEl
            .children(`.${params.slideClass}:not(.${params.slideDuplicateClass})[data-swiper-slide-index="${realIndex}"]`)
            .addClass(params.slideDuplicateActiveClass);
        } else {
          $wrapperEl
            .children(`.${params.slideClass}.${params.slideDuplicateClass}[data-swiper-slide-index="${realIndex}"]`)
            .addClass(params.slideDuplicateActiveClass);
        }
      }
      // Next Slide
      let nextSlide = activeSlide.nextAll(`.${params.slideClass}`).eq(0).addClass(params.slideNextClass);
      if (params.loop && nextSlide.length === 0) {
        nextSlide = slides.eq(0);
        nextSlide.addClass(params.slideNextClass);
      }
      // Prev Slide
      let prevSlide = activeSlide.prevAll(`.${params.slideClass}`).eq(0).addClass(params.slidePrevClass);
      if (params.loop && prevSlide.length === 0) {
        prevSlide = slides.eq(-1);
        prevSlide.addClass(params.slidePrevClass);
      }
      if (params.loop) {
        // Duplicate to all looped slides
        if (nextSlide.hasClass(params.slideDuplicateClass)) {
          $wrapperEl
            .children(`.${params.slideClass}:not(.${params.slideDuplicateClass})[data-swiper-slide-index="${nextSlide.attr('data-swiper-slide-index')}"]`)
            .addClass(params.slideDuplicateNextClass);
        } else {
          $wrapperEl
            .children(`.${params.slideClass}.${params.slideDuplicateClass}[data-swiper-slide-index="${nextSlide.attr('data-swiper-slide-index')}"]`)
            .addClass(params.slideDuplicateNextClass);
        }
        if (prevSlide.hasClass(params.slideDuplicateClass)) {
          $wrapperEl
            .children(`.${params.slideClass}:not(.${params.slideDuplicateClass})[data-swiper-slide-index="${prevSlide.attr('data-swiper-slide-index')}"]`)
            .addClass(params.slideDuplicatePrevClass);
        } else {
          $wrapperEl
            .children(`.${params.slideClass}.${params.slideDuplicateClass}[data-swiper-slide-index="${prevSlide.attr('data-swiper-slide-index')}"]`)
            .addClass(params.slideDuplicatePrevClass);
        }
      }
    }

    function updateActiveIndex (newActiveIndex) {
      const swiper = this;
      const translate = swiper.rtlTranslate ? swiper.translate : -swiper.translate;
      const {
        slidesGrid, snapGrid, params, activeIndex: previousIndex, realIndex: previousRealIndex, snapIndex: previousSnapIndex,
      } = swiper;
      let activeIndex = newActiveIndex;
      let snapIndex;
      if (typeof activeIndex === 'undefined') {
        for (let i = 0; i < slidesGrid.length; i += 1) {
          if (typeof slidesGrid[i + 1] !== 'undefined') {
            if (translate >= slidesGrid[i] && translate < slidesGrid[i + 1] - ((slidesGrid[i + 1] - slidesGrid[i]) / 2)) {
              activeIndex = i;
            } else if (translate >= slidesGrid[i] && translate < slidesGrid[i + 1]) {
              activeIndex = i + 1;
            }
          } else if (translate >= slidesGrid[i]) {
            activeIndex = i;
          }
        }
        // Normalize slideIndex
        if (params.normalizeSlideIndex) {
          if (activeIndex < 0 || typeof activeIndex === 'undefined') activeIndex = 0;
        }
      }
      if (snapGrid.indexOf(translate) >= 0) {
        snapIndex = snapGrid.indexOf(translate);
      } else {
        snapIndex = Math.floor(activeIndex / params.slidesPerGroup);
      }
      if (snapIndex >= snapGrid.length) snapIndex = snapGrid.length - 1;
      if (activeIndex === previousIndex) {
        if (snapIndex !== previousSnapIndex) {
          swiper.snapIndex = snapIndex;
          swiper.emit('snapIndexChange');
        }
        return;
      }

      // Get real index
      const realIndex = parseInt(swiper.slides.eq(activeIndex).attr('data-swiper-slide-index') || activeIndex, 10);

      Utils.extend(swiper, {
        snapIndex,
        realIndex,
        previousIndex,
        activeIndex,
      });
      swiper.emit('activeIndexChange');
      swiper.emit('snapIndexChange');
      if (previousRealIndex !== realIndex) {
        swiper.emit('realIndexChange');
      }
      if (swiper.initialized || swiper.runCallbacksOnInit) {
        swiper.emit('slideChange');
      }
    }

    function updateClickedSlide (e) {
      const swiper = this;
      const params = swiper.params;
      const slide = $(e.target).closest(`.${params.slideClass}`)[0];
      let slideFound = false;
      if (slide) {
        for (let i = 0; i < swiper.slides.length; i += 1) {
          if (swiper.slides[i] === slide) slideFound = true;
        }
      }

      if (slide && slideFound) {
        swiper.clickedSlide = slide;
        if (swiper.virtual && swiper.params.virtual.enabled) {
          swiper.clickedIndex = parseInt($(slide).attr('data-swiper-slide-index'), 10);
        } else {
          swiper.clickedIndex = $(slide).index();
        }
      } else {
        swiper.clickedSlide = undefined;
        swiper.clickedIndex = undefined;
        return;
      }
      if (params.slideToClickedSlide && swiper.clickedIndex !== undefined && swiper.clickedIndex !== swiper.activeIndex) {
        swiper.slideToClickedSlide();
      }
    }

    var update$1 = {
      updateSize,
      updateSlides,
      updateAutoHeight,
      updateSlidesOffset,
      updateSlidesProgress,
      updateProgress,
      updateSlidesClasses,
      updateActiveIndex,
      updateClickedSlide,
    };

    function getTranslate (axis = this.isHorizontal() ? 'x' : 'y') {
      const swiper = this;

      const {
        params, rtlTranslate: rtl, translate, $wrapperEl,
      } = swiper;

      if (params.virtualTranslate) {
        return rtl ? -translate : translate;
      }

      let currentTranslate = Utils.getTranslate($wrapperEl[0], axis);
      if (rtl) currentTranslate = -currentTranslate;

      return currentTranslate || 0;
    }

    function setTranslate (translate, byController) {
      const swiper = this;
      const {
        rtlTranslate: rtl, params, $wrapperEl, progress,
      } = swiper;
      let x = 0;
      let y = 0;
      const z = 0;

      if (swiper.isHorizontal()) {
        x = rtl ? -translate : translate;
      } else {
        y = translate;
      }

      if (params.roundLengths) {
        x = Math.floor(x);
        y = Math.floor(y);
      }

      if (!params.virtualTranslate) {
        if (Support.transforms3d) $wrapperEl.transform(`translate3d(${x}px, ${y}px, ${z}px)`);
        else $wrapperEl.transform(`translate(${x}px, ${y}px)`);
      }
      swiper.previousTranslate = swiper.translate;
      swiper.translate = swiper.isHorizontal() ? x : y;

      // Check if we need to update progress
      let newProgress;
      const translatesDiff = swiper.maxTranslate() - swiper.minTranslate();
      if (translatesDiff === 0) {
        newProgress = 0;
      } else {
        newProgress = (translate - swiper.minTranslate()) / (translatesDiff);
      }
      if (newProgress !== progress) {
        swiper.updateProgress(translate);
      }

      swiper.emit('setTranslate', swiper.translate, byController);
    }

    function minTranslate () {
      return (-this.snapGrid[0]);
    }

    function maxTranslate () {
      return (-this.snapGrid[this.snapGrid.length - 1]);
    }

    var translate = {
      getTranslate,
      setTranslate,
      minTranslate,
      maxTranslate,
    };

    function setTransition (duration, byController) {
      const swiper = this;

      swiper.$wrapperEl.transition(duration);

      swiper.emit('setTransition', duration, byController);
    }

    function transitionStart (runCallbacks = true, direction) {
      const swiper = this;
      const { activeIndex, params, previousIndex } = swiper;
      if (params.autoHeight) {
        swiper.updateAutoHeight();
      }

      let dir = direction;
      if (!dir) {
        if (activeIndex > previousIndex) dir = 'next';
        else if (activeIndex < previousIndex) dir = 'prev';
        else dir = 'reset';
      }

      swiper.emit('transitionStart');

      if (runCallbacks && activeIndex !== previousIndex) {
        if (dir === 'reset') {
          swiper.emit('slideResetTransitionStart');
          return;
        }
        swiper.emit('slideChangeTransitionStart');
        if (dir === 'next') {
          swiper.emit('slideNextTransitionStart');
        } else {
          swiper.emit('slidePrevTransitionStart');
        }
      }
    }

    function transitionEnd$1 (runCallbacks = true, direction) {
      const swiper = this;
      const { activeIndex, previousIndex } = swiper;
      swiper.animating = false;
      swiper.setTransition(0);

      let dir = direction;
      if (!dir) {
        if (activeIndex > previousIndex) dir = 'next';
        else if (activeIndex < previousIndex) dir = 'prev';
        else dir = 'reset';
      }

      swiper.emit('transitionEnd');

      if (runCallbacks && activeIndex !== previousIndex) {
        if (dir === 'reset') {
          swiper.emit('slideResetTransitionEnd');
          return;
        }
        swiper.emit('slideChangeTransitionEnd');
        if (dir === 'next') {
          swiper.emit('slideNextTransitionEnd');
        } else {
          swiper.emit('slidePrevTransitionEnd');
        }
      }
    }

    var transition$1 = {
      setTransition,
      transitionStart,
      transitionEnd: transitionEnd$1,
    };

    function slideTo (index = 0, speed = this.params.speed, runCallbacks = true, internal) {
      const swiper = this;
      let slideIndex = index;
      if (slideIndex < 0) slideIndex = 0;

      const {
        params, snapGrid, slidesGrid, previousIndex, activeIndex, rtlTranslate: rtl,
      } = swiper;
      if (swiper.animating && params.preventInteractionOnTransition) {
        return false;
      }

      let snapIndex = Math.floor(slideIndex / params.slidesPerGroup);
      if (snapIndex >= snapGrid.length) snapIndex = snapGrid.length - 1;

      if ((activeIndex || params.initialSlide || 0) === (previousIndex || 0) && runCallbacks) {
        swiper.emit('beforeSlideChangeStart');
      }

      const translate = -snapGrid[snapIndex];

      // Update progress
      swiper.updateProgress(translate);

      // Normalize slideIndex
      if (params.normalizeSlideIndex) {
        for (let i = 0; i < slidesGrid.length; i += 1) {
          if (-Math.floor(translate * 100) >= Math.floor(slidesGrid[i] * 100)) {
            slideIndex = i;
          }
        }
      }
      // Directions locks
      if (swiper.initialized && slideIndex !== activeIndex) {
        if (!swiper.allowSlideNext && translate < swiper.translate && translate < swiper.minTranslate()) {
          return false;
        }
        if (!swiper.allowSlidePrev && translate > swiper.translate && translate > swiper.maxTranslate()) {
          if ((activeIndex || 0) !== slideIndex) return false;
        }
      }

      let direction;
      if (slideIndex > activeIndex) direction = 'next';
      else if (slideIndex < activeIndex) direction = 'prev';
      else direction = 'reset';


      // Update Index
      if ((rtl && -translate === swiper.translate) || (!rtl && translate === swiper.translate)) {
        swiper.updateActiveIndex(slideIndex);
        // Update Height
        if (params.autoHeight) {
          swiper.updateAutoHeight();
        }
        swiper.updateSlidesClasses();
        if (params.effect !== 'slide') {
          swiper.setTranslate(translate);
        }
        if (direction !== 'reset') {
          swiper.transitionStart(runCallbacks, direction);
          swiper.transitionEnd(runCallbacks, direction);
        }
        return false;
      }

      if (speed === 0 || !Support.transition) {
        swiper.setTransition(0);
        swiper.setTranslate(translate);
        swiper.updateActiveIndex(slideIndex);
        swiper.updateSlidesClasses();
        swiper.emit('beforeTransitionStart', speed, internal);
        swiper.transitionStart(runCallbacks, direction);
        swiper.transitionEnd(runCallbacks, direction);
      } else {
        swiper.setTransition(speed);
        swiper.setTranslate(translate);
        swiper.updateActiveIndex(slideIndex);
        swiper.updateSlidesClasses();
        swiper.emit('beforeTransitionStart', speed, internal);
        swiper.transitionStart(runCallbacks, direction);
        if (!swiper.animating) {
          swiper.animating = true;
          if (!swiper.onSlideToWrapperTransitionEnd) {
            swiper.onSlideToWrapperTransitionEnd = function transitionEnd(e) {
              if (!swiper || swiper.destroyed) return;
              if (e.target !== this) return;
              swiper.$wrapperEl[0].removeEventListener('transitionend', swiper.onSlideToWrapperTransitionEnd);
              swiper.$wrapperEl[0].removeEventListener('webkitTransitionEnd', swiper.onSlideToWrapperTransitionEnd);
              swiper.onSlideToWrapperTransitionEnd = null;
              delete swiper.onSlideToWrapperTransitionEnd;
              swiper.transitionEnd(runCallbacks, direction);
            };
          }
          swiper.$wrapperEl[0].addEventListener('transitionend', swiper.onSlideToWrapperTransitionEnd);
          swiper.$wrapperEl[0].addEventListener('webkitTransitionEnd', swiper.onSlideToWrapperTransitionEnd);
        }
      }

      return true;
    }

    function slideToLoop (index = 0, speed = this.params.speed, runCallbacks = true, internal) {
      const swiper = this;
      let newIndex = index;
      if (swiper.params.loop) {
        newIndex += swiper.loopedSlides;
      }

      return swiper.slideTo(newIndex, speed, runCallbacks, internal);
    }

    /* eslint no-unused-vars: "off" */
    function slideNext (speed = this.params.speed, runCallbacks = true, internal) {
      const swiper = this;
      const { params, animating } = swiper;
      if (params.loop) {
        if (animating) return false;
        swiper.loopFix();
        // eslint-disable-next-line
        swiper._clientLeft = swiper.$wrapperEl[0].clientLeft;
        return swiper.slideTo(swiper.activeIndex + params.slidesPerGroup, speed, runCallbacks, internal);
      }
      return swiper.slideTo(swiper.activeIndex + params.slidesPerGroup, speed, runCallbacks, internal);
    }

    /* eslint no-unused-vars: "off" */
    function slidePrev (speed = this.params.speed, runCallbacks = true, internal) {
      const swiper = this;
      const {
        params, animating, snapGrid, slidesGrid, rtlTranslate,
      } = swiper;

      if (params.loop) {
        if (animating) return false;
        swiper.loopFix();
        // eslint-disable-next-line
        swiper._clientLeft = swiper.$wrapperEl[0].clientLeft;
      }
      const translate = rtlTranslate ? swiper.translate : -swiper.translate;
      function normalize(val) {
        if (val < 0) return -Math.floor(Math.abs(val));
        return Math.floor(val);
      }
      const normalizedTranslate = normalize(translate);
      const normalizedSnapGrid = snapGrid.map((val) => normalize(val));
      const normalizedSlidesGrid = slidesGrid.map((val) => normalize(val));

      const currentSnap = snapGrid[normalizedSnapGrid.indexOf(normalizedTranslate)];
      const prevSnap = snapGrid[normalizedSnapGrid.indexOf(normalizedTranslate) - 1];
      let prevIndex;
      if (typeof prevSnap !== 'undefined') {
        prevIndex = slidesGrid.indexOf(prevSnap);
        if (prevIndex < 0) prevIndex = swiper.activeIndex - 1;
      }
      return swiper.slideTo(prevIndex, speed, runCallbacks, internal);
    }

    /* eslint no-unused-vars: "off" */
    function slideReset (speed = this.params.speed, runCallbacks = true, internal) {
      const swiper = this;
      return swiper.slideTo(swiper.activeIndex, speed, runCallbacks, internal);
    }

    /* eslint no-unused-vars: "off" */
    function slideToClosest (speed = this.params.speed, runCallbacks = true, internal) {
      const swiper = this;
      let index = swiper.activeIndex;
      const snapIndex = Math.floor(index / swiper.params.slidesPerGroup);

      if (snapIndex < swiper.snapGrid.length - 1) {
        const translate = swiper.rtlTranslate ? swiper.translate : -swiper.translate;

        const currentSnap = swiper.snapGrid[snapIndex];
        const nextSnap = swiper.snapGrid[snapIndex + 1];

        if ((translate - currentSnap) > (nextSnap - currentSnap) / 2) {
          index = swiper.params.slidesPerGroup;
        }
      }

      return swiper.slideTo(index, speed, runCallbacks, internal);
    }

    function slideToClickedSlide () {
      const swiper = this;
      const { params, $wrapperEl } = swiper;

      const slidesPerView = params.slidesPerView === 'auto' ? swiper.slidesPerViewDynamic() : params.slidesPerView;
      let slideToIndex = swiper.clickedIndex;
      let realIndex;
      if (params.loop) {
        if (swiper.animating) return;
        realIndex = parseInt($(swiper.clickedSlide).attr('data-swiper-slide-index'), 10);
        if (params.centeredSlides) {
          if (
            (slideToIndex < swiper.loopedSlides - (slidesPerView / 2))
            || (slideToIndex > (swiper.slides.length - swiper.loopedSlides) + (slidesPerView / 2))
          ) {
            swiper.loopFix();
            slideToIndex = $wrapperEl
              .children(`.${params.slideClass}[data-swiper-slide-index="${realIndex}"]:not(.${params.slideDuplicateClass})`)
              .eq(0)
              .index();

            Utils.nextTick(() => {
              swiper.slideTo(slideToIndex);
            });
          } else {
            swiper.slideTo(slideToIndex);
          }
        } else if (slideToIndex > swiper.slides.length - slidesPerView) {
          swiper.loopFix();
          slideToIndex = $wrapperEl
            .children(`.${params.slideClass}[data-swiper-slide-index="${realIndex}"]:not(.${params.slideDuplicateClass})`)
            .eq(0)
            .index();

          Utils.nextTick(() => {
            swiper.slideTo(slideToIndex);
          });
        } else {
          swiper.slideTo(slideToIndex);
        }
      } else {
        swiper.slideTo(slideToIndex);
      }
    }

    var slide = {
      slideTo,
      slideToLoop,
      slideNext,
      slidePrev,
      slideReset,
      slideToClosest,
      slideToClickedSlide,
    };

    function loopCreate () {
      const swiper = this;
      const { params, $wrapperEl } = swiper;
      // Remove duplicated slides
      $wrapperEl.children(`.${params.slideClass}.${params.slideDuplicateClass}`).remove();

      let slides = $wrapperEl.children(`.${params.slideClass}`);

      if (params.loopFillGroupWithBlank) {
        const blankSlidesNum = params.slidesPerGroup - (slides.length % params.slidesPerGroup);
        if (blankSlidesNum !== params.slidesPerGroup) {
          for (let i = 0; i < blankSlidesNum; i += 1) {
            const blankNode = $(doc.createElement('div')).addClass(`${params.slideClass} ${params.slideBlankClass}`);
            $wrapperEl.append(blankNode);
          }
          slides = $wrapperEl.children(`.${params.slideClass}`);
        }
      }

      if (params.slidesPerView === 'auto' && !params.loopedSlides) params.loopedSlides = slides.length;

      swiper.loopedSlides = parseInt(params.loopedSlides || params.slidesPerView, 10);
      swiper.loopedSlides += params.loopAdditionalSlides;
      if (swiper.loopedSlides > slides.length) {
        swiper.loopedSlides = slides.length;
      }

      const prependSlides = [];
      const appendSlides = [];
      slides.each((index, el) => {
        const slide = $(el);
        if (index < swiper.loopedSlides) appendSlides.push(el);
        if (index < slides.length && index >= slides.length - swiper.loopedSlides) prependSlides.push(el);
        slide.attr('data-swiper-slide-index', index);
      });
      for (let i = 0; i < appendSlides.length; i += 1) {
        $wrapperEl.append($(appendSlides[i].cloneNode(true)).addClass(params.slideDuplicateClass));
      }
      for (let i = prependSlides.length - 1; i >= 0; i -= 1) {
        $wrapperEl.prepend($(prependSlides[i].cloneNode(true)).addClass(params.slideDuplicateClass));
      }
    }

    function loopFix () {
      const swiper = this;
      const {
        params, activeIndex, slides, loopedSlides, allowSlidePrev, allowSlideNext, snapGrid, rtlTranslate: rtl,
      } = swiper;
      let newIndex;
      swiper.allowSlidePrev = true;
      swiper.allowSlideNext = true;

      const snapTranslate = -snapGrid[activeIndex];
      const diff = snapTranslate - swiper.getTranslate();


      // Fix For Negative Oversliding
      if (activeIndex < loopedSlides) {
        newIndex = (slides.length - (loopedSlides * 3)) + activeIndex;
        newIndex += loopedSlides;
        const slideChanged = swiper.slideTo(newIndex, 0, false, true);
        if (slideChanged && diff !== 0) {
          swiper.setTranslate((rtl ? -swiper.translate : swiper.translate) - diff);
        }
      } else if ((params.slidesPerView === 'auto' && activeIndex >= loopedSlides * 2) || (activeIndex >= slides.length - loopedSlides)) {
        // Fix For Positive Oversliding
        newIndex = -slides.length + activeIndex + loopedSlides;
        newIndex += loopedSlides;
        const slideChanged = swiper.slideTo(newIndex, 0, false, true);
        if (slideChanged && diff !== 0) {
          swiper.setTranslate((rtl ? -swiper.translate : swiper.translate) - diff);
        }
      }
      swiper.allowSlidePrev = allowSlidePrev;
      swiper.allowSlideNext = allowSlideNext;
    }

    function loopDestroy () {
      const swiper = this;
      const { $wrapperEl, params, slides } = swiper;
      $wrapperEl.children(`.${params.slideClass}.${params.slideDuplicateClass},.${params.slideClass}.${params.slideBlankClass}`).remove();
      slides.removeAttr('data-swiper-slide-index');
    }

    var loop$1 = {
      loopCreate,
      loopFix,
      loopDestroy,
    };

    function setGrabCursor (moving) {
      const swiper = this;
      if (Support.touch || !swiper.params.simulateTouch || (swiper.params.watchOverflow && swiper.isLocked)) return;
      const el = swiper.el;
      el.style.cursor = 'move';
      el.style.cursor = moving ? '-webkit-grabbing' : '-webkit-grab';
      el.style.cursor = moving ? '-moz-grabbin' : '-moz-grab';
      el.style.cursor = moving ? 'grabbing' : 'grab';
    }

    function unsetGrabCursor () {
      const swiper = this;
      if (Support.touch || (swiper.params.watchOverflow && swiper.isLocked)) return;
      swiper.el.style.cursor = '';
    }

    var grabCursor = {
      setGrabCursor,
      unsetGrabCursor,
    };

    function appendSlide (slides) {
      const swiper = this;
      const { $wrapperEl, params } = swiper;
      if (params.loop) {
        swiper.loopDestroy();
      }
      if (typeof slides === 'object' && 'length' in slides) {
        for (let i = 0; i < slides.length; i += 1) {
          if (slides[i]) $wrapperEl.append(slides[i]);
        }
      } else {
        $wrapperEl.append(slides);
      }
      if (params.loop) {
        swiper.loopCreate();
      }
      if (!(params.observer && Support.observer)) {
        swiper.update();
      }
    }

    function prependSlide (slides) {
      const swiper = this;
      const { params, $wrapperEl, activeIndex } = swiper;

      if (params.loop) {
        swiper.loopDestroy();
      }
      let newActiveIndex = activeIndex + 1;
      if (typeof slides === 'object' && 'length' in slides) {
        for (let i = 0; i < slides.length; i += 1) {
          if (slides[i]) $wrapperEl.prepend(slides[i]);
        }
        newActiveIndex = activeIndex + slides.length;
      } else {
        $wrapperEl.prepend(slides);
      }
      if (params.loop) {
        swiper.loopCreate();
      }
      if (!(params.observer && Support.observer)) {
        swiper.update();
      }
      swiper.slideTo(newActiveIndex, 0, false);
    }

    function addSlide (index, slides) {
      const swiper = this;
      const { $wrapperEl, params, activeIndex } = swiper;
      let activeIndexBuffer = activeIndex;
      if (params.loop) {
        activeIndexBuffer -= swiper.loopedSlides;
        swiper.loopDestroy();
        swiper.slides = $wrapperEl.children(`.${params.slideClass}`);
      }
      const baseLength = swiper.slides.length;
      if (index <= 0) {
        swiper.prependSlide(slides);
        return;
      }
      if (index >= baseLength) {
        swiper.appendSlide(slides);
        return;
      }
      let newActiveIndex = activeIndexBuffer > index ? activeIndexBuffer + 1 : activeIndexBuffer;

      const slidesBuffer = [];
      for (let i = baseLength - 1; i >= index; i -= 1) {
        const currentSlide = swiper.slides.eq(i);
        currentSlide.remove();
        slidesBuffer.unshift(currentSlide);
      }

      if (typeof slides === 'object' && 'length' in slides) {
        for (let i = 0; i < slides.length; i += 1) {
          if (slides[i]) $wrapperEl.append(slides[i]);
        }
        newActiveIndex = activeIndexBuffer > index ? activeIndexBuffer + slides.length : activeIndexBuffer;
      } else {
        $wrapperEl.append(slides);
      }

      for (let i = 0; i < slidesBuffer.length; i += 1) {
        $wrapperEl.append(slidesBuffer[i]);
      }

      if (params.loop) {
        swiper.loopCreate();
      }
      if (!(params.observer && Support.observer)) {
        swiper.update();
      }
      if (params.loop) {
        swiper.slideTo(newActiveIndex + swiper.loopedSlides, 0, false);
      } else {
        swiper.slideTo(newActiveIndex, 0, false);
      }
    }

    function removeSlide (slidesIndexes) {
      const swiper = this;
      const { params, $wrapperEl, activeIndex } = swiper;

      let activeIndexBuffer = activeIndex;
      if (params.loop) {
        activeIndexBuffer -= swiper.loopedSlides;
        swiper.loopDestroy();
        swiper.slides = $wrapperEl.children(`.${params.slideClass}`);
      }
      let newActiveIndex = activeIndexBuffer;
      let indexToRemove;

      if (typeof slidesIndexes === 'object' && 'length' in slidesIndexes) {
        for (let i = 0; i < slidesIndexes.length; i += 1) {
          indexToRemove = slidesIndexes[i];
          if (swiper.slides[indexToRemove]) swiper.slides.eq(indexToRemove).remove();
          if (indexToRemove < newActiveIndex) newActiveIndex -= 1;
        }
        newActiveIndex = Math.max(newActiveIndex, 0);
      } else {
        indexToRemove = slidesIndexes;
        if (swiper.slides[indexToRemove]) swiper.slides.eq(indexToRemove).remove();
        if (indexToRemove < newActiveIndex) newActiveIndex -= 1;
        newActiveIndex = Math.max(newActiveIndex, 0);
      }

      if (params.loop) {
        swiper.loopCreate();
      }

      if (!(params.observer && Support.observer)) {
        swiper.update();
      }
      if (params.loop) {
        swiper.slideTo(newActiveIndex + swiper.loopedSlides, 0, false);
      } else {
        swiper.slideTo(newActiveIndex, 0, false);
      }
    }

    function removeAllSlides () {
      const swiper = this;

      const slidesIndexes = [];
      for (let i = 0; i < swiper.slides.length; i += 1) {
        slidesIndexes.push(i);
      }
      swiper.removeSlide(slidesIndexes);
    }

    var manipulation = {
      appendSlide,
      prependSlide,
      addSlide,
      removeSlide,
      removeAllSlides,
    };

    const Device = (function Device() {
      const ua = win.navigator.userAgent;

      const device = {
        ios: false,
        android: false,
        androidChrome: false,
        desktop: false,
        windows: false,
        iphone: false,
        ipod: false,
        ipad: false,
        cordova: win.cordova || win.phonegap,
        phonegap: win.cordova || win.phonegap,
      };

      const windows = ua.match(/(Windows Phone);?[\s\/]+([\d.]+)?/); // eslint-disable-line
      const android = ua.match(/(Android);?[\s\/]+([\d.]+)?/); // eslint-disable-line
      const ipad = ua.match(/(iPad).*OS\s([\d_]+)/);
      const ipod = ua.match(/(iPod)(.*OS\s([\d_]+))?/);
      const iphone = !ipad && ua.match(/(iPhone\sOS|iOS)\s([\d_]+)/);


      // Windows
      if (windows) {
        device.os = 'windows';
        device.osVersion = windows[2];
        device.windows = true;
      }
      // Android
      if (android && !windows) {
        device.os = 'android';
        device.osVersion = android[2];
        device.android = true;
        device.androidChrome = ua.toLowerCase().indexOf('chrome') >= 0;
      }
      if (ipad || iphone || ipod) {
        device.os = 'ios';
        device.ios = true;
      }
      // iOS
      if (iphone && !ipod) {
        device.osVersion = iphone[2].replace(/_/g, '.');
        device.iphone = true;
      }
      if (ipad) {
        device.osVersion = ipad[2].replace(/_/g, '.');
        device.ipad = true;
      }
      if (ipod) {
        device.osVersion = ipod[3] ? ipod[3].replace(/_/g, '.') : null;
        device.iphone = true;
      }
      // iOS 8+ changed UA
      if (device.ios && device.osVersion && ua.indexOf('Version/') >= 0) {
        if (device.osVersion.split('.')[0] === '10') {
          device.osVersion = ua.toLowerCase().split('version/')[1].split(' ')[0];
        }
      }

      // Desktop
      device.desktop = !(device.os || device.android || device.webView);

      // Webview
      device.webView = (iphone || ipad || ipod) && ua.match(/.*AppleWebKit(?!.*Safari)/i);

      // Minimal UI
      if (device.os && device.os === 'ios') {
        const osVersionArr = device.osVersion.split('.');
        const metaViewport = doc.querySelector('meta[name="viewport"]');
        device.minimalUi = !device.webView
          && (ipod || iphone)
          && (osVersionArr[0] * 1 === 7 ? osVersionArr[1] * 1 >= 1 : osVersionArr[0] * 1 > 7)
          && metaViewport && metaViewport.getAttribute('content').indexOf('minimal-ui') >= 0;
      }

      // Pixel Ratio
      device.pixelRatio = win.devicePixelRatio || 1;

      // Export object
      return device;
    }());

    function onTouchStart (event) {
      const swiper = this;
      const data = swiper.touchEventsData;
      const { params, touches } = swiper;
      if (swiper.animating && params.preventInteractionOnTransition) {
        return;
      }
      let e = event;
      if (e.originalEvent) e = e.originalEvent;
      data.isTouchEvent = e.type === 'touchstart';
      if (!data.isTouchEvent && 'which' in e && e.which === 3) return;
      if (!data.isTouchEvent && 'button' in e && e.button > 0) return;
      if (data.isTouched && data.isMoved) return;
      if (params.noSwiping && $(e.target).closest(params.noSwipingSelector ? params.noSwipingSelector : `.${params.noSwipingClass}`)[0]) {
        swiper.allowClick = true;
        return;
      }
      if (params.swipeHandler) {
        if (!$(e).closest(params.swipeHandler)[0]) return;
      }

      touches.currentX = e.type === 'touchstart' ? e.targetTouches[0].pageX : e.pageX;
      touches.currentY = e.type === 'touchstart' ? e.targetTouches[0].pageY : e.pageY;
      const startX = touches.currentX;
      const startY = touches.currentY;

      // Do NOT start if iOS edge swipe is detected. Otherwise iOS app (UIWebView) cannot swipe-to-go-back anymore

      const edgeSwipeDetection = params.edgeSwipeDetection || params.iOSEdgeSwipeDetection;
      const edgeSwipeThreshold = params.edgeSwipeThreshold || params.iOSEdgeSwipeThreshold;
      if (
        edgeSwipeDetection
        && ((startX <= edgeSwipeThreshold)
        || (startX >= win.screen.width - edgeSwipeThreshold))
      ) {
        return;
      }

      Utils.extend(data, {
        isTouched: true,
        isMoved: false,
        allowTouchCallbacks: true,
        isScrolling: undefined,
        startMoving: undefined,
      });

      touches.startX = startX;
      touches.startY = startY;
      data.touchStartTime = Utils.now();
      swiper.allowClick = true;
      swiper.updateSize();
      swiper.swipeDirection = undefined;
      if (params.threshold > 0) data.allowThresholdMove = false;
      if (e.type !== 'touchstart') {
        let preventDefault = true;
        if ($(e.target).is(data.formElements)) preventDefault = false;
        if (
          doc.activeElement
          && $(doc.activeElement).is(data.formElements)
          && doc.activeElement !== e.target
        ) {
          doc.activeElement.blur();
        }

        const shouldPreventDefault = preventDefault && swiper.allowTouchMove && params.touchStartPreventDefault;
        if (params.touchStartForcePreventDefault || shouldPreventDefault) {
          e.preventDefault();
        }
      }
      swiper.emit('touchStart', e);
    }

    function onTouchMove (event) {
      const swiper = this;
      const data = swiper.touchEventsData;
      const { params, touches, rtlTranslate: rtl } = swiper;
      let e = event;
      if (e.originalEvent) e = e.originalEvent;
      if (!data.isTouched) {
        if (data.startMoving && data.isScrolling) {
          swiper.emit('touchMoveOpposite', e);
        }
        return;
      }
      if (data.isTouchEvent && e.type === 'mousemove') return;
      const pageX = e.type === 'touchmove' ? e.targetTouches[0].pageX : e.pageX;
      const pageY = e.type === 'touchmove' ? e.targetTouches[0].pageY : e.pageY;
      if (e.preventedByNestedSwiper) {
        touches.startX = pageX;
        touches.startY = pageY;
        return;
      }
      if (!swiper.allowTouchMove) {
        // isMoved = true;
        swiper.allowClick = false;
        if (data.isTouched) {
          Utils.extend(touches, {
            startX: pageX,
            startY: pageY,
            currentX: pageX,
            currentY: pageY,
          });
          data.touchStartTime = Utils.now();
        }
        return;
      }
      if (data.isTouchEvent && params.touchReleaseOnEdges && !params.loop) {
        if (swiper.isVertical()) {
          // Vertical
          if (
            (pageY < touches.startY && swiper.translate <= swiper.maxTranslate())
            || (pageY > touches.startY && swiper.translate >= swiper.minTranslate())
          ) {
            data.isTouched = false;
            data.isMoved = false;
            return;
          }
        } else if (
          (pageX < touches.startX && swiper.translate <= swiper.maxTranslate())
          || (pageX > touches.startX && swiper.translate >= swiper.minTranslate())
        ) {
          return;
        }
      }
      if (data.isTouchEvent && doc.activeElement) {
        if (e.target === doc.activeElement && $(e.target).is(data.formElements)) {
          data.isMoved = true;
          swiper.allowClick = false;
          return;
        }
      }
      if (data.allowTouchCallbacks) {
        swiper.emit('touchMove', e);
      }
      if (e.targetTouches && e.targetTouches.length > 1) return;

      touches.currentX = pageX;
      touches.currentY = pageY;

      const diffX = touches.currentX - touches.startX;
      const diffY = touches.currentY - touches.startY;
      if (swiper.params.threshold && Math.sqrt((diffX ** 2) + (diffY ** 2)) < swiper.params.threshold) return;

      if (typeof data.isScrolling === 'undefined') {
        let touchAngle;
        if ((swiper.isHorizontal() && touches.currentY === touches.startY) || (swiper.isVertical() && touches.currentX === touches.startX)) {
          data.isScrolling = false;
        } else {
          // eslint-disable-next-line
          if ((diffX * diffX) + (diffY * diffY) >= 25) {
            touchAngle = (Math.atan2(Math.abs(diffY), Math.abs(diffX)) * 180) / Math.PI;
            data.isScrolling = swiper.isHorizontal() ? touchAngle > params.touchAngle : (90 - touchAngle > params.touchAngle);
          }
        }
      }
      if (data.isScrolling) {
        swiper.emit('touchMoveOpposite', e);
      }
      if (typeof data.startMoving === 'undefined') {
        if (touches.currentX !== touches.startX || touches.currentY !== touches.startY) {
          data.startMoving = true;
        }
      }
      if (data.isScrolling) {
        data.isTouched = false;
        return;
      }
      if (!data.startMoving) {
        return;
      }
      swiper.allowClick = false;
      e.preventDefault();
      if (params.touchMoveStopPropagation && !params.nested) {
        e.stopPropagation();
      }

      if (!data.isMoved) {
        if (params.loop) {
          swiper.loopFix();
        }
        data.startTranslate = swiper.getTranslate();
        swiper.setTransition(0);
        if (swiper.animating) {
          swiper.$wrapperEl.trigger('webkitTransitionEnd transitionend');
        }
        data.allowMomentumBounce = false;
        // Grab Cursor
        if (params.grabCursor && (swiper.allowSlideNext === true || swiper.allowSlidePrev === true)) {
          swiper.setGrabCursor(true);
        }
        swiper.emit('sliderFirstMove', e);
      }
      swiper.emit('sliderMove', e);
      data.isMoved = true;

      let diff = swiper.isHorizontal() ? diffX : diffY;
      touches.diff = diff;

      diff *= params.touchRatio;
      if (rtl) diff = -diff;

      swiper.swipeDirection = diff > 0 ? 'prev' : 'next';
      data.currentTranslate = diff + data.startTranslate;

      let disableParentSwiper = true;
      let resistanceRatio = params.resistanceRatio;
      if (params.touchReleaseOnEdges) {
        resistanceRatio = 0;
      }
      if ((diff > 0 && data.currentTranslate > swiper.minTranslate())) {
        disableParentSwiper = false;
        if (params.resistance) data.currentTranslate = (swiper.minTranslate() - 1) + ((-swiper.minTranslate() + data.startTranslate + diff) ** resistanceRatio);
      } else if (diff < 0 && data.currentTranslate < swiper.maxTranslate()) {
        disableParentSwiper = false;
        if (params.resistance) data.currentTranslate = (swiper.maxTranslate() + 1) - ((swiper.maxTranslate() - data.startTranslate - diff) ** resistanceRatio);
      }

      if (disableParentSwiper) {
        e.preventedByNestedSwiper = true;
      }

      // Directions locks
      if (!swiper.allowSlideNext && swiper.swipeDirection === 'next' && data.currentTranslate < data.startTranslate) {
        data.currentTranslate = data.startTranslate;
      }
      if (!swiper.allowSlidePrev && swiper.swipeDirection === 'prev' && data.currentTranslate > data.startTranslate) {
        data.currentTranslate = data.startTranslate;
      }


      // Threshold
      if (params.threshold > 0) {
        if (Math.abs(diff) > params.threshold || data.allowThresholdMove) {
          if (!data.allowThresholdMove) {
            data.allowThresholdMove = true;
            touches.startX = touches.currentX;
            touches.startY = touches.currentY;
            data.currentTranslate = data.startTranslate;
            touches.diff = swiper.isHorizontal() ? touches.currentX - touches.startX : touches.currentY - touches.startY;
            return;
          }
        } else {
          data.currentTranslate = data.startTranslate;
          return;
        }
      }

      if (!params.followFinger) return;

      // Update active index in free mode
      if (params.freeMode || params.watchSlidesProgress || params.watchSlidesVisibility) {
        swiper.updateActiveIndex();
        swiper.updateSlidesClasses();
      }
      if (params.freeMode) {
        // Velocity
        if (data.velocities.length === 0) {
          data.velocities.push({
            position: touches[swiper.isHorizontal() ? 'startX' : 'startY'],
            time: data.touchStartTime,
          });
        }
        data.velocities.push({
          position: touches[swiper.isHorizontal() ? 'currentX' : 'currentY'],
          time: Utils.now(),
        });
      }
      // Update progress
      swiper.updateProgress(data.currentTranslate);
      // Update translate
      swiper.setTranslate(data.currentTranslate);
    }

    function onTouchEnd (event) {
      const swiper = this;
      const data = swiper.touchEventsData;

      const {
        params, touches, rtlTranslate: rtl, $wrapperEl, slidesGrid, snapGrid,
      } = swiper;
      let e = event;
      if (e.originalEvent) e = e.originalEvent;
      if (data.allowTouchCallbacks) {
        swiper.emit('touchEnd', e);
      }
      data.allowTouchCallbacks = false;
      if (!data.isTouched) {
        if (data.isMoved && params.grabCursor) {
          swiper.setGrabCursor(false);
        }
        data.isMoved = false;
        data.startMoving = false;
        return;
      }
      // Return Grab Cursor
      if (params.grabCursor && data.isMoved && data.isTouched && (swiper.allowSlideNext === true || swiper.allowSlidePrev === true)) {
        swiper.setGrabCursor(false);
      }

      // Time diff
      const touchEndTime = Utils.now();
      const timeDiff = touchEndTime - data.touchStartTime;

      // Tap, doubleTap, Click
      if (swiper.allowClick) {
        swiper.updateClickedSlide(e);
        swiper.emit('tap', e);
        if (timeDiff < 300 && (touchEndTime - data.lastClickTime) > 300) {
          if (data.clickTimeout) clearTimeout(data.clickTimeout);
          data.clickTimeout = Utils.nextTick(() => {
            if (!swiper || swiper.destroyed) return;
            swiper.emit('click', e);
          }, 300);
        }
        if (timeDiff < 300 && (touchEndTime - data.lastClickTime) < 300) {
          if (data.clickTimeout) clearTimeout(data.clickTimeout);
          swiper.emit('doubleTap', e);
        }
      }

      data.lastClickTime = Utils.now();
      Utils.nextTick(() => {
        if (!swiper.destroyed) swiper.allowClick = true;
      });

      if (!data.isTouched || !data.isMoved || !swiper.swipeDirection || touches.diff === 0 || data.currentTranslate === data.startTranslate) {
        data.isTouched = false;
        data.isMoved = false;
        data.startMoving = false;
        return;
      }
      data.isTouched = false;
      data.isMoved = false;
      data.startMoving = false;

      let currentPos;
      if (params.followFinger) {
        currentPos = rtl ? swiper.translate : -swiper.translate;
      } else {
        currentPos = -data.currentTranslate;
      }

      if (params.freeMode) {
        if (currentPos < -swiper.minTranslate()) {
          swiper.slideTo(swiper.activeIndex);
          return;
        }
        if (currentPos > -swiper.maxTranslate()) {
          if (swiper.slides.length < snapGrid.length) {
            swiper.slideTo(snapGrid.length - 1);
          } else {
            swiper.slideTo(swiper.slides.length - 1);
          }
          return;
        }

        if (params.freeModeMomentum) {
          if (data.velocities.length > 1) {
            const lastMoveEvent = data.velocities.pop();
            const velocityEvent = data.velocities.pop();

            const distance = lastMoveEvent.position - velocityEvent.position;
            const time = lastMoveEvent.time - velocityEvent.time;
            swiper.velocity = distance / time;
            swiper.velocity /= 2;
            if (Math.abs(swiper.velocity) < params.freeModeMinimumVelocity) {
              swiper.velocity = 0;
            }
            // this implies that the user stopped moving a finger then released.
            // There would be no events with distance zero, so the last event is stale.
            if (time > 150 || (Utils.now() - lastMoveEvent.time) > 300) {
              swiper.velocity = 0;
            }
          } else {
            swiper.velocity = 0;
          }
          swiper.velocity *= params.freeModeMomentumVelocityRatio;

          data.velocities.length = 0;
          let momentumDuration = 1000 * params.freeModeMomentumRatio;
          const momentumDistance = swiper.velocity * momentumDuration;

          let newPosition = swiper.translate + momentumDistance;
          if (rtl) newPosition = -newPosition;

          let doBounce = false;
          let afterBouncePosition;
          const bounceAmount = Math.abs(swiper.velocity) * 20 * params.freeModeMomentumBounceRatio;
          let needsLoopFix;
          if (newPosition < swiper.maxTranslate()) {
            if (params.freeModeMomentumBounce) {
              if (newPosition + swiper.maxTranslate() < -bounceAmount) {
                newPosition = swiper.maxTranslate() - bounceAmount;
              }
              afterBouncePosition = swiper.maxTranslate();
              doBounce = true;
              data.allowMomentumBounce = true;
            } else {
              newPosition = swiper.maxTranslate();
            }
            if (params.loop && params.centeredSlides) needsLoopFix = true;
          } else if (newPosition > swiper.minTranslate()) {
            if (params.freeModeMomentumBounce) {
              if (newPosition - swiper.minTranslate() > bounceAmount) {
                newPosition = swiper.minTranslate() + bounceAmount;
              }
              afterBouncePosition = swiper.minTranslate();
              doBounce = true;
              data.allowMomentumBounce = true;
            } else {
              newPosition = swiper.minTranslate();
            }
            if (params.loop && params.centeredSlides) needsLoopFix = true;
          } else if (params.freeModeSticky) {
            let nextSlide;
            for (let j = 0; j < snapGrid.length; j += 1) {
              if (snapGrid[j] > -newPosition) {
                nextSlide = j;
                break;
              }
            }

            if (Math.abs(snapGrid[nextSlide] - newPosition) < Math.abs(snapGrid[nextSlide - 1] - newPosition) || swiper.swipeDirection === 'next') {
              newPosition = snapGrid[nextSlide];
            } else {
              newPosition = snapGrid[nextSlide - 1];
            }
            newPosition = -newPosition;
          }
          if (needsLoopFix) {
            swiper.once('transitionEnd', () => {
              swiper.loopFix();
            });
          }
          // Fix duration
          if (swiper.velocity !== 0) {
            if (rtl) {
              momentumDuration = Math.abs((-newPosition - swiper.translate) / swiper.velocity);
            } else {
              momentumDuration = Math.abs((newPosition - swiper.translate) / swiper.velocity);
            }
          } else if (params.freeModeSticky) {
            swiper.slideToClosest();
            return;
          }

          if (params.freeModeMomentumBounce && doBounce) {
            swiper.updateProgress(afterBouncePosition);
            swiper.setTransition(momentumDuration);
            swiper.setTranslate(newPosition);
            swiper.transitionStart(true, swiper.swipeDirection);
            swiper.animating = true;
            $wrapperEl.transitionEnd(() => {
              if (!swiper || swiper.destroyed || !data.allowMomentumBounce) return;
              swiper.emit('momentumBounce');

              swiper.setTransition(params.speed);
              swiper.setTranslate(afterBouncePosition);
              $wrapperEl.transitionEnd(() => {
                if (!swiper || swiper.destroyed) return;
                swiper.transitionEnd();
              });
            });
          } else if (swiper.velocity) {
            swiper.updateProgress(newPosition);
            swiper.setTransition(momentumDuration);
            swiper.setTranslate(newPosition);
            swiper.transitionStart(true, swiper.swipeDirection);
            if (!swiper.animating) {
              swiper.animating = true;
              $wrapperEl.transitionEnd(() => {
                if (!swiper || swiper.destroyed) return;
                swiper.transitionEnd();
              });
            }
          } else {
            swiper.updateProgress(newPosition);
          }

          swiper.updateActiveIndex();
          swiper.updateSlidesClasses();
        } else if (params.freeModeSticky) {
          swiper.slideToClosest();
          return;
        }

        if (!params.freeModeMomentum || timeDiff >= params.longSwipesMs) {
          swiper.updateProgress();
          swiper.updateActiveIndex();
          swiper.updateSlidesClasses();
        }
        return;
      }

      // Find current slide
      let stopIndex = 0;
      let groupSize = swiper.slidesSizesGrid[0];
      for (let i = 0; i < slidesGrid.length; i += params.slidesPerGroup) {
        if (typeof slidesGrid[i + params.slidesPerGroup] !== 'undefined') {
          if (currentPos >= slidesGrid[i] && currentPos < slidesGrid[i + params.slidesPerGroup]) {
            stopIndex = i;
            groupSize = slidesGrid[i + params.slidesPerGroup] - slidesGrid[i];
          }
        } else if (currentPos >= slidesGrid[i]) {
          stopIndex = i;
          groupSize = slidesGrid[slidesGrid.length - 1] - slidesGrid[slidesGrid.length - 2];
        }
      }

      // Find current slide size
      const ratio = (currentPos - slidesGrid[stopIndex]) / groupSize;

      if (timeDiff > params.longSwipesMs) {
        // Long touches
        if (!params.longSwipes) {
          swiper.slideTo(swiper.activeIndex);
          return;
        }
        if (swiper.swipeDirection === 'next') {
          if (ratio >= params.longSwipesRatio) swiper.slideTo(stopIndex + params.slidesPerGroup);
          else swiper.slideTo(stopIndex);
        }
        if (swiper.swipeDirection === 'prev') {
          if (ratio > (1 - params.longSwipesRatio)) swiper.slideTo(stopIndex + params.slidesPerGroup);
          else swiper.slideTo(stopIndex);
        }
      } else {
        // Short swipes
        if (!params.shortSwipes) {
          swiper.slideTo(swiper.activeIndex);
          return;
        }
        if (swiper.swipeDirection === 'next') {
          swiper.slideTo(stopIndex + params.slidesPerGroup);
        }
        if (swiper.swipeDirection === 'prev') {
          swiper.slideTo(stopIndex);
        }
      }
    }

    function onResize () {
      const swiper = this;

      const { params, el } = swiper;

      if (el && el.offsetWidth === 0) return;

      // Breakpoints
      if (params.breakpoints) {
        swiper.setBreakpoint();
      }

      // Save locks
      const { allowSlideNext, allowSlidePrev, snapGrid } = swiper;

      // Disable locks on resize
      swiper.allowSlideNext = true;
      swiper.allowSlidePrev = true;

      swiper.updateSize();
      swiper.updateSlides();

      if (params.freeMode) {
        const newTranslate = Math.min(Math.max(swiper.translate, swiper.maxTranslate()), swiper.minTranslate());
        swiper.setTranslate(newTranslate);
        swiper.updateActiveIndex();
        swiper.updateSlidesClasses();

        if (params.autoHeight) {
          swiper.updateAutoHeight();
        }
      } else {
        swiper.updateSlidesClasses();
        if ((params.slidesPerView === 'auto' || params.slidesPerView > 1) && swiper.isEnd && !swiper.params.centeredSlides) {
          swiper.slideTo(swiper.slides.length - 1, 0, false, true);
        } else {
          swiper.slideTo(swiper.activeIndex, 0, false, true);
        }
      }
      if (swiper.autoplay && swiper.autoplay.running && swiper.autoplay.paused) {
        swiper.autoplay.run();
      }
      // Return locks after resize
      swiper.allowSlidePrev = allowSlidePrev;
      swiper.allowSlideNext = allowSlideNext;

      if (swiper.params.watchOverflow && snapGrid !== swiper.snapGrid) {
        swiper.checkOverflow();
      }
    }

    function onClick (e) {
      const swiper = this;
      if (!swiper.allowClick) {
        if (swiper.params.preventClicks) e.preventDefault();
        if (swiper.params.preventClicksPropagation && swiper.animating) {
          e.stopPropagation();
          e.stopImmediatePropagation();
        }
      }
    }

    function attachEvents() {
      const swiper = this;
      const {
        params, touchEvents, el, wrapperEl,
      } = swiper;

      {
        swiper.onTouchStart = onTouchStart.bind(swiper);
        swiper.onTouchMove = onTouchMove.bind(swiper);
        swiper.onTouchEnd = onTouchEnd.bind(swiper);
      }

      swiper.onClick = onClick.bind(swiper);

      const target = params.touchEventsTarget === 'container' ? el : wrapperEl;
      const capture = !!params.nested;

      // Touch Events
      {
        if (!Support.touch && (Support.pointerEvents || Support.prefixedPointerEvents)) {
          target.addEventListener(touchEvents.start, swiper.onTouchStart, false);
          doc.addEventListener(touchEvents.move, swiper.onTouchMove, capture);
          doc.addEventListener(touchEvents.end, swiper.onTouchEnd, false);
        } else {
          if (Support.touch) {
            const passiveListener = touchEvents.start === 'touchstart' && Support.passiveListener && params.passiveListeners ? { passive: true, capture: false } : false;
            target.addEventListener(touchEvents.start, swiper.onTouchStart, passiveListener);
            target.addEventListener(touchEvents.move, swiper.onTouchMove, Support.passiveListener ? { passive: false, capture } : capture);
            target.addEventListener(touchEvents.end, swiper.onTouchEnd, passiveListener);
          }
          if ((params.simulateTouch && !Device.ios && !Device.android) || (params.simulateTouch && !Support.touch && Device.ios)) {
            target.addEventListener('mousedown', swiper.onTouchStart, false);
            doc.addEventListener('mousemove', swiper.onTouchMove, capture);
            doc.addEventListener('mouseup', swiper.onTouchEnd, false);
          }
        }
        // Prevent Links Clicks
        if (params.preventClicks || params.preventClicksPropagation) {
          target.addEventListener('click', swiper.onClick, true);
        }
      }

      // Resize handler
      swiper.on((Device.ios || Device.android ? 'resize orientationchange observerUpdate' : 'resize observerUpdate'), onResize, true);
    }

    function detachEvents() {
      const swiper = this;

      const {
        params, touchEvents, el, wrapperEl,
      } = swiper;

      const target = params.touchEventsTarget === 'container' ? el : wrapperEl;
      const capture = !!params.nested;

      // Touch Events
      {
        if (!Support.touch && (Support.pointerEvents || Support.prefixedPointerEvents)) {
          target.removeEventListener(touchEvents.start, swiper.onTouchStart, false);
          doc.removeEventListener(touchEvents.move, swiper.onTouchMove, capture);
          doc.removeEventListener(touchEvents.end, swiper.onTouchEnd, false);
        } else {
          if (Support.touch) {
            const passiveListener = touchEvents.start === 'onTouchStart' && Support.passiveListener && params.passiveListeners ? { passive: true, capture: false } : false;
            target.removeEventListener(touchEvents.start, swiper.onTouchStart, passiveListener);
            target.removeEventListener(touchEvents.move, swiper.onTouchMove, capture);
            target.removeEventListener(touchEvents.end, swiper.onTouchEnd, passiveListener);
          }
          if ((params.simulateTouch && !Device.ios && !Device.android) || (params.simulateTouch && !Support.touch && Device.ios)) {
            target.removeEventListener('mousedown', swiper.onTouchStart, false);
            doc.removeEventListener('mousemove', swiper.onTouchMove, capture);
            doc.removeEventListener('mouseup', swiper.onTouchEnd, false);
          }
        }
        // Prevent Links Clicks
        if (params.preventClicks || params.preventClicksPropagation) {
          target.removeEventListener('click', swiper.onClick, true);
        }
      }

      // Resize handler
      swiper.off((Device.ios || Device.android ? 'resize orientationchange observerUpdate' : 'resize observerUpdate'), onResize);
    }

    var events = {
      attachEvents,
      detachEvents,
    };

    function setBreakpoint () {
      const swiper = this;
      const {
        activeIndex, initialized, loopedSlides = 0, params,
      } = swiper;
      const breakpoints = params.breakpoints;
      if (!breakpoints || (breakpoints && Object.keys(breakpoints).length === 0)) return;

      // Set breakpoint for window width and update parameters
      const breakpoint = swiper.getBreakpoint(breakpoints);

      if (breakpoint && swiper.currentBreakpoint !== breakpoint) {
        const breakpointOnlyParams = breakpoint in breakpoints ? breakpoints[breakpoint] : undefined;
        if (breakpointOnlyParams) {
          ['slidesPerView', 'spaceBetween', 'slidesPerGroup'].forEach((param) => {
            const paramValue = breakpointOnlyParams[param];
            if (typeof paramValue === 'undefined') return;
            if (param === 'slidesPerView' && (paramValue === 'AUTO' || paramValue === 'auto')) {
              breakpointOnlyParams[param] = 'auto';
            } else if (param === 'slidesPerView') {
              breakpointOnlyParams[param] = parseFloat(paramValue);
            } else {
              breakpointOnlyParams[param] = parseInt(paramValue, 10);
            }
          });
        }

        const breakpointParams = breakpointOnlyParams || swiper.originalParams;
        const directionChanged = breakpointParams.direction && breakpointParams.direction !== params.direction;
        const needsReLoop = params.loop && (breakpointParams.slidesPerView !== params.slidesPerView || directionChanged);

        if (directionChanged && initialized) {
          swiper.changeDirection();
        }

        Utils.extend(swiper.params, breakpointParams);

        Utils.extend(swiper, {
          allowTouchMove: swiper.params.allowTouchMove,
          allowSlideNext: swiper.params.allowSlideNext,
          allowSlidePrev: swiper.params.allowSlidePrev,
        });

        swiper.currentBreakpoint = breakpoint;

        if (needsReLoop && initialized) {
          swiper.loopDestroy();
          swiper.loopCreate();
          swiper.updateSlides();
          swiper.slideTo((activeIndex - loopedSlides) + swiper.loopedSlides, 0, false);
        }

        swiper.emit('breakpoint', breakpointParams);
      }
    }

    function getBreakpoint (breakpoints) {
      const swiper = this;
      // Get breakpoint for window width
      if (!breakpoints) return undefined;
      let breakpoint = false;
      const points = [];
      Object.keys(breakpoints).forEach((point) => {
        points.push(point);
      });
      points.sort((a, b) => parseInt(a, 10) - parseInt(b, 10));
      for (let i = 0; i < points.length; i += 1) {
        const point = points[i];
        if (swiper.params.breakpointsInverse) {
          if (point <= win.innerWidth) {
            breakpoint = point;
          }
        } else if (point >= win.innerWidth && !breakpoint) {
          breakpoint = point;
        }
      }
      return breakpoint || 'max';
    }

    var breakpoints = { setBreakpoint, getBreakpoint };

    function addClasses () {
      const swiper = this;
      const {
        classNames, params, rtl, $el,
      } = swiper;
      const suffixes = [];

      suffixes.push('initialized');
      suffixes.push(params.direction);

      if (params.freeMode) {
        suffixes.push('free-mode');
      }
      if (!Support.flexbox) {
        suffixes.push('no-flexbox');
      }
      if (params.autoHeight) {
        suffixes.push('autoheight');
      }
      if (rtl) {
        suffixes.push('rtl');
      }
      if (params.slidesPerColumn > 1) {
        suffixes.push('multirow');
      }
      if (Device.android) {
        suffixes.push('android');
      }
      if (Device.ios) {
        suffixes.push('ios');
      }
      // WP8 Touch Events Fix
      if ((Browser.isIE || Browser.isEdge) && (Support.pointerEvents || Support.prefixedPointerEvents)) {
        suffixes.push(`wp8-${params.direction}`);
      }

      suffixes.forEach((suffix) => {
        classNames.push(params.containerModifierClass + suffix);
      });

      $el.addClass(classNames.join(' '));
    }

    function removeClasses () {
      const swiper = this;
      const { $el, classNames } = swiper;

      $el.removeClass(classNames.join(' '));
    }

    var classes = { addClasses, removeClasses };

    function loadImage (imageEl, src, srcset, sizes, checkForComplete, callback) {
      let image;
      function onReady() {
        if (callback) callback();
      }
      if (!imageEl.complete || !checkForComplete) {
        if (src) {
          image = new win.Image();
          image.onload = onReady;
          image.onerror = onReady;
          if (sizes) {
            image.sizes = sizes;
          }
          if (srcset) {
            image.srcset = srcset;
          }
          if (src) {
            image.src = src;
          }
        } else {
          onReady();
        }
      } else {
        // image already loaded...
        onReady();
      }
    }

    function preloadImages () {
      const swiper = this;
      swiper.imagesToLoad = swiper.$el.find('img');
      function onReady() {
        if (typeof swiper === 'undefined' || swiper === null || !swiper || swiper.destroyed) return;
        if (swiper.imagesLoaded !== undefined) swiper.imagesLoaded += 1;
        if (swiper.imagesLoaded === swiper.imagesToLoad.length) {
          if (swiper.params.updateOnImagesReady) swiper.update();
          swiper.emit('imagesReady');
        }
      }
      for (let i = 0; i < swiper.imagesToLoad.length; i += 1) {
        const imageEl = swiper.imagesToLoad[i];
        swiper.loadImage(
          imageEl,
          imageEl.currentSrc || imageEl.getAttribute('src'),
          imageEl.srcset || imageEl.getAttribute('srcset'),
          imageEl.sizes || imageEl.getAttribute('sizes'),
          true,
          onReady
        );
      }
    }

    var images = {
      loadImage,
      preloadImages,
    };

    function checkOverflow() {
      const swiper = this;
      const wasLocked = swiper.isLocked;

      swiper.isLocked = swiper.snapGrid.length === 1;
      swiper.allowSlideNext = !swiper.isLocked;
      swiper.allowSlidePrev = !swiper.isLocked;

      // events
      if (wasLocked !== swiper.isLocked) swiper.emit(swiper.isLocked ? 'lock' : 'unlock');

      if (wasLocked && wasLocked !== swiper.isLocked) {
        swiper.isEnd = false;
        swiper.navigation.update();
      }
    }

    var checkOverflow$1 = { checkOverflow };

    var defaults = {
      init: true,
      direction: 'horizontal',
      touchEventsTarget: 'container',
      initialSlide: 0,
      speed: 300,
      //
      preventInteractionOnTransition: false,

      // To support iOS's swipe-to-go-back gesture (when being used in-app, with UIWebView).
      edgeSwipeDetection: false,
      edgeSwipeThreshold: 20,

      // Free mode
      freeMode: false,
      freeModeMomentum: true,
      freeModeMomentumRatio: 1,
      freeModeMomentumBounce: true,
      freeModeMomentumBounceRatio: 1,
      freeModeMomentumVelocityRatio: 1,
      freeModeSticky: false,
      freeModeMinimumVelocity: 0.02,

      // Autoheight
      autoHeight: false,

      // Set wrapper width
      setWrapperSize: false,

      // Virtual Translate
      virtualTranslate: false,

      // Effects
      effect: 'slide', // 'slide' or 'fade' or 'cube' or 'coverflow' or 'flip'

      // Breakpoints
      breakpoints: undefined,
      breakpointsInverse: false,

      // Slides grid
      spaceBetween: 0,
      slidesPerView: 1,
      slidesPerColumn: 1,
      slidesPerColumnFill: 'column',
      slidesPerGroup: 1,
      centeredSlides: false,
      slidesOffsetBefore: 0, // in px
      slidesOffsetAfter: 0, // in px
      normalizeSlideIndex: true,
      centerInsufficientSlides: false,

      // Disable swiper and hide navigation when container not overflow
      watchOverflow: false,

      // Round length
      roundLengths: false,

      // Touches
      touchRatio: 1,
      touchAngle: 45,
      simulateTouch: true,
      shortSwipes: true,
      longSwipes: true,
      longSwipesRatio: 0.5,
      longSwipesMs: 300,
      followFinger: true,
      allowTouchMove: true,
      threshold: 0,
      touchMoveStopPropagation: true,
      touchStartPreventDefault: true,
      touchStartForcePreventDefault: false,
      touchReleaseOnEdges: false,

      // Unique Navigation Elements
      uniqueNavElements: true,

      // Resistance
      resistance: true,
      resistanceRatio: 0.85,

      // Progress
      watchSlidesProgress: false,
      watchSlidesVisibility: false,

      // Cursor
      grabCursor: false,

      // Clicks
      preventClicks: true,
      preventClicksPropagation: true,
      slideToClickedSlide: false,

      // Images
      preloadImages: true,
      updateOnImagesReady: true,

      // loop
      loop: false,
      loopAdditionalSlides: 0,
      loopedSlides: null,
      loopFillGroupWithBlank: false,

      // Swiping/no swiping
      allowSlidePrev: true,
      allowSlideNext: true,
      swipeHandler: null, // '.swipe-handler',
      noSwiping: true,
      noSwipingClass: 'swiper-no-swiping',
      noSwipingSelector: null,

      // Passive Listeners
      passiveListeners: true,

      // NS
      containerModifierClass: 'swiper-container-', // NEW
      slideClass: 'swiper-slide',
      slideBlankClass: 'swiper-slide-invisible-blank',
      slideActiveClass: 'swiper-slide-active',
      slideDuplicateActiveClass: 'swiper-slide-duplicate-active',
      slideVisibleClass: 'swiper-slide-visible',
      slideDuplicateClass: 'swiper-slide-duplicate',
      slideNextClass: 'swiper-slide-next',
      slideDuplicateNextClass: 'swiper-slide-duplicate-next',
      slidePrevClass: 'swiper-slide-prev',
      slideDuplicatePrevClass: 'swiper-slide-duplicate-prev',
      wrapperClass: 'swiper-wrapper',

      // Callbacks
      runCallbacksOnInit: true,
    };

    /* eslint no-param-reassign: "off" */

    const prototypes = {
      update: update$1,
      translate,
      transition: transition$1,
      slide,
      loop: loop$1,
      grabCursor,
      manipulation,
      events,
      breakpoints,
      checkOverflow: checkOverflow$1,
      classes,
      images,
    };

    const extendedDefaults = {};

    class Swiper extends SwiperClass {
      constructor(...args) {
        let el;
        let params;
        if (args.length === 1 && args[0].constructor && args[0].constructor === Object) {
          params = args[0];
        } else {
          [el, params] = args;
        }
        if (!params) params = {};

        params = Utils.extend({}, params);
        if (el && !params.el) params.el = el;

        super(params);

        Object.keys(prototypes).forEach((prototypeGroup) => {
          Object.keys(prototypes[prototypeGroup]).forEach((protoMethod) => {
            if (!Swiper.prototype[protoMethod]) {
              Swiper.prototype[protoMethod] = prototypes[prototypeGroup][protoMethod];
            }
          });
        });

        // Swiper Instance
        const swiper = this;
        if (typeof swiper.modules === 'undefined') {
          swiper.modules = {};
        }
        Object.keys(swiper.modules).forEach((moduleName) => {
          const module = swiper.modules[moduleName];
          if (module.params) {
            const moduleParamName = Object.keys(module.params)[0];
            const moduleParams = module.params[moduleParamName];
            if (typeof moduleParams !== 'object' || moduleParams === null) return;
            if (!(moduleParamName in params && 'enabled' in moduleParams)) return;
            if (params[moduleParamName] === true) {
              params[moduleParamName] = { enabled: true };
            }
            if (
              typeof params[moduleParamName] === 'object'
              && !('enabled' in params[moduleParamName])
            ) {
              params[moduleParamName].enabled = true;
            }
            if (!params[moduleParamName]) params[moduleParamName] = { enabled: false };
          }
        });

        // Extend defaults with modules params
        const swiperParams = Utils.extend({}, defaults);
        swiper.useModulesParams(swiperParams);

        // Extend defaults with passed params
        swiper.params = Utils.extend({}, swiperParams, extendedDefaults, params);
        swiper.originalParams = Utils.extend({}, swiper.params);
        swiper.passedParams = Utils.extend({}, params);

        // Save Dom lib
        swiper.$ = $;

        // Find el
        const $el = $(swiper.params.el);
        el = $el[0];

        if (!el) {
          return undefined;
        }

        if ($el.length > 1) {
          const swipers = [];
          $el.each((index, containerEl) => {
            const newParams = Utils.extend({}, params, { el: containerEl });
            swipers.push(new Swiper(newParams));
          });
          return swipers;
        }

        el.swiper = swiper;
        $el.data('swiper', swiper);

        // Find Wrapper
        const $wrapperEl = $el.children(`.${swiper.params.wrapperClass}`);

        // Extend Swiper
        Utils.extend(swiper, {
          $el,
          el,
          $wrapperEl,
          wrapperEl: $wrapperEl[0],

          // Classes
          classNames: [],

          // Slides
          slides: $(),
          slidesGrid: [],
          snapGrid: [],
          slidesSizesGrid: [],

          // isDirection
          isHorizontal() {
            return swiper.params.direction === 'horizontal';
          },
          isVertical() {
            return swiper.params.direction === 'vertical';
          },
          // RTL
          rtl: (el.dir.toLowerCase() === 'rtl' || $el.css('direction') === 'rtl'),
          rtlTranslate: swiper.params.direction === 'horizontal' && (el.dir.toLowerCase() === 'rtl' || $el.css('direction') === 'rtl'),
          wrongRTL: $wrapperEl.css('display') === '-webkit-box',

          // Indexes
          activeIndex: 0,
          realIndex: 0,

          //
          isBeginning: true,
          isEnd: false,

          // Props
          translate: 0,
          previousTranslate: 0,
          progress: 0,
          velocity: 0,
          animating: false,

          // Locks
          allowSlideNext: swiper.params.allowSlideNext,
          allowSlidePrev: swiper.params.allowSlidePrev,

          // Touch Events
          touchEvents: (function touchEvents() {
            const touch = ['touchstart', 'touchmove', 'touchend'];
            let desktop = ['mousedown', 'mousemove', 'mouseup'];
            if (Support.pointerEvents) {
              desktop = ['pointerdown', 'pointermove', 'pointerup'];
            } else if (Support.prefixedPointerEvents) {
              desktop = ['MSPointerDown', 'MSPointerMove', 'MSPointerUp'];
            }
            swiper.touchEventsTouch = {
              start: touch[0],
              move: touch[1],
              end: touch[2],
            };
            swiper.touchEventsDesktop = {
              start: desktop[0],
              move: desktop[1],
              end: desktop[2],
            };
            return Support.touch || !swiper.params.simulateTouch ? swiper.touchEventsTouch : swiper.touchEventsDesktop;
          }()),
          touchEventsData: {
            isTouched: undefined,
            isMoved: undefined,
            allowTouchCallbacks: undefined,
            touchStartTime: undefined,
            isScrolling: undefined,
            currentTranslate: undefined,
            startTranslate: undefined,
            allowThresholdMove: undefined,
            // Form elements to match
            formElements: 'input, select, option, textarea, button, video',
            // Last click time
            lastClickTime: Utils.now(),
            clickTimeout: undefined,
            // Velocities
            velocities: [],
            allowMomentumBounce: undefined,
            isTouchEvent: undefined,
            startMoving: undefined,
          },

          // Clicks
          allowClick: true,

          // Touches
          allowTouchMove: swiper.params.allowTouchMove,

          touches: {
            startX: 0,
            startY: 0,
            currentX: 0,
            currentY: 0,
            diff: 0,
          },

          // Images
          imagesToLoad: [],
          imagesLoaded: 0,

        });

        // Install Modules
        swiper.useModules();

        // Init
        if (swiper.params.init) {
          swiper.init();
        }

        // Return app instance
        return swiper;
      }

      slidesPerViewDynamic() {
        const swiper = this;
        const {
          params, slides, slidesGrid, size: swiperSize, activeIndex,
        } = swiper;
        let spv = 1;
        if (params.centeredSlides) {
          let slideSize = slides[activeIndex].swiperSlideSize;
          let breakLoop;
          for (let i = activeIndex + 1; i < slides.length; i += 1) {
            if (slides[i] && !breakLoop) {
              slideSize += slides[i].swiperSlideSize;
              spv += 1;
              if (slideSize > swiperSize) breakLoop = true;
            }
          }
          for (let i = activeIndex - 1; i >= 0; i -= 1) {
            if (slides[i] && !breakLoop) {
              slideSize += slides[i].swiperSlideSize;
              spv += 1;
              if (slideSize > swiperSize) breakLoop = true;
            }
          }
        } else {
          for (let i = activeIndex + 1; i < slides.length; i += 1) {
            if (slidesGrid[i] - slidesGrid[activeIndex] < swiperSize) {
              spv += 1;
            }
          }
        }
        return spv;
      }

      update() {
        const swiper = this;
        if (!swiper || swiper.destroyed) return;
        const { snapGrid, params } = swiper;
        // Breakpoints
        if (params.breakpoints) {
          swiper.setBreakpoint();
        }
        swiper.updateSize();
        swiper.updateSlides();
        swiper.updateProgress();
        swiper.updateSlidesClasses();

        function setTranslate() {
          const translateValue = swiper.rtlTranslate ? swiper.translate * -1 : swiper.translate;
          const newTranslate = Math.min(Math.max(translateValue, swiper.maxTranslate()), swiper.minTranslate());
          swiper.setTranslate(newTranslate);
          swiper.updateActiveIndex();
          swiper.updateSlidesClasses();
        }
        let translated;
        if (swiper.params.freeMode) {
          setTranslate();
          if (swiper.params.autoHeight) {
            swiper.updateAutoHeight();
          }
        } else {
          if ((swiper.params.slidesPerView === 'auto' || swiper.params.slidesPerView > 1) && swiper.isEnd && !swiper.params.centeredSlides) {
            translated = swiper.slideTo(swiper.slides.length - 1, 0, false, true);
          } else {
            translated = swiper.slideTo(swiper.activeIndex, 0, false, true);
          }
          if (!translated) {
            setTranslate();
          }
        }
        if (params.watchOverflow && snapGrid !== swiper.snapGrid) {
          swiper.checkOverflow();
        }
        swiper.emit('update');
      }

      changeDirection(newDirection, needUpdate = true) {
        const swiper = this;
        const currentDirection = swiper.params.direction;
        if (!newDirection) {
          // eslint-disable-next-line
          newDirection = currentDirection === 'horizontal' ? 'vertical' : 'horizontal';
        }
        if ((newDirection === currentDirection) || (newDirection !== 'horizontal' && newDirection !== 'vertical')) {
          return swiper;
        }

        swiper.$el
          .removeClass(`${swiper.params.containerModifierClass}${currentDirection} wp8-${currentDirection}`)
          .addClass(`${swiper.params.containerModifierClass}${newDirection}`);

        if ((Browser.isIE || Browser.isEdge) && (Support.pointerEvents || Support.prefixedPointerEvents)) {
          swiper.$el.addClass(`${swiper.params.containerModifierClass}wp8-${newDirection}`);
        }

        swiper.params.direction = newDirection;

        swiper.slides.each((slideIndex, slideEl) => {
          if (newDirection === 'vertical') {
            slideEl.style.width = '';
          } else {
            slideEl.style.height = '';
          }
        });

        swiper.emit('changeDirection');
        if (needUpdate) swiper.update();

        return swiper;
      }

      init() {
        const swiper = this;
        if (swiper.initialized) return;

        swiper.emit('beforeInit');

        // Set breakpoint
        if (swiper.params.breakpoints) {
          swiper.setBreakpoint();
        }

        // Add Classes
        swiper.addClasses();

        // Create loop
        if (swiper.params.loop) {
          swiper.loopCreate();
        }

        // Update size
        swiper.updateSize();

        // Update slides
        swiper.updateSlides();

        if (swiper.params.watchOverflow) {
          swiper.checkOverflow();
        }

        // Set Grab Cursor
        if (swiper.params.grabCursor) {
          swiper.setGrabCursor();
        }

        if (swiper.params.preloadImages) {
          swiper.preloadImages();
        }

        // Slide To Initial Slide
        if (swiper.params.loop) {
          swiper.slideTo(swiper.params.initialSlide + swiper.loopedSlides, 0, swiper.params.runCallbacksOnInit);
        } else {
          swiper.slideTo(swiper.params.initialSlide, 0, swiper.params.runCallbacksOnInit);
        }

        // Attach events
        swiper.attachEvents();

        // Init Flag
        swiper.initialized = true;

        // Emit
        swiper.emit('init');
      }

      destroy(deleteInstance = true, cleanStyles = true) {
        const swiper = this;
        const {
          params, $el, $wrapperEl, slides,
        } = swiper;

        if (typeof swiper.params === 'undefined' || swiper.destroyed) {
          return null;
        }

        swiper.emit('beforeDestroy');

        // Init Flag
        swiper.initialized = false;

        // Detach events
        swiper.detachEvents();

        // Destroy loop
        if (params.loop) {
          swiper.loopDestroy();
        }

        // Cleanup styles
        if (cleanStyles) {
          swiper.removeClasses();
          $el.removeAttr('style');
          $wrapperEl.removeAttr('style');
          if (slides && slides.length) {
            slides
              .removeClass([
                params.slideVisibleClass,
                params.slideActiveClass,
                params.slideNextClass,
                params.slidePrevClass,
              ].join(' '))
              .removeAttr('style')
              .removeAttr('data-swiper-slide-index')
              .removeAttr('data-swiper-column')
              .removeAttr('data-swiper-row');
          }
        }

        swiper.emit('destroy');

        // Detach emitter events
        Object.keys(swiper.eventsListeners).forEach((eventName) => {
          swiper.off(eventName);
        });

        if (deleteInstance !== false) {
          swiper.$el[0].swiper = null;
          swiper.$el.data('swiper', null);
          Utils.deleteProps(swiper);
        }
        swiper.destroyed = true;

        return null;
      }

      static extendDefaults(newDefaults) {
        Utils.extend(extendedDefaults, newDefaults);
      }

      static get extendedDefaults() {
        return extendedDefaults;
      }

      static get defaults() {
        return defaults;
      }

      static get Class() {
        return SwiperClass;
      }

      static get $() {
        return $;
      }
    }

    var Device$1 = {
      name: 'device',
      proto: {
        device: Device,
      },
      static: {
        device: Device,
      },
    };

    var Support$1 = {
      name: 'support',
      proto: {
        support: Support,
      },
      static: {
        support: Support,
      },
    };

    var Browser$1 = {
      name: 'browser',
      proto: {
        browser: Browser,
      },
      static: {
        browser: Browser,
      },
    };

    var Resize = {
      name: 'resize',
      create() {
        const swiper = this;
        Utils.extend(swiper, {
          resize: {
            resizeHandler() {
              if (!swiper || swiper.destroyed || !swiper.initialized) return;
              swiper.emit('beforeResize');
              swiper.emit('resize');
            },
            orientationChangeHandler() {
              if (!swiper || swiper.destroyed || !swiper.initialized) return;
              swiper.emit('orientationchange');
            },
          },
        });
      },
      on: {
        init() {
          const swiper = this;
          // Emit resize
          win.addEventListener('resize', swiper.resize.resizeHandler);

          // Emit orientationchange
          win.addEventListener('orientationchange', swiper.resize.orientationChangeHandler);
        },
        destroy() {
          const swiper = this;
          win.removeEventListener('resize', swiper.resize.resizeHandler);
          win.removeEventListener('orientationchange', swiper.resize.orientationChangeHandler);
        },
      },
    };

    const Observer = {
      func: win.MutationObserver || win.WebkitMutationObserver,
      attach(target, options = {}) {
        const swiper = this;

        const ObserverFunc = Observer.func;
        const observer = new ObserverFunc((mutations) => {
          // The observerUpdate event should only be triggered
          // once despite the number of mutations.  Additional
          // triggers are redundant and are very costly
          if (mutations.length === 1) {
            swiper.emit('observerUpdate', mutations[0]);
            return;
          }
          const observerUpdate = function observerUpdate() {
            swiper.emit('observerUpdate', mutations[0]);
          };

          if (win.requestAnimationFrame) {
            win.requestAnimationFrame(observerUpdate);
          } else {
            win.setTimeout(observerUpdate, 0);
          }
        });

        observer.observe(target, {
          attributes: typeof options.attributes === 'undefined' ? true : options.attributes,
          childList: typeof options.childList === 'undefined' ? true : options.childList,
          characterData: typeof options.characterData === 'undefined' ? true : options.characterData,
        });

        swiper.observer.observers.push(observer);
      },
      init() {
        const swiper = this;
        if (!Support.observer || !swiper.params.observer) return;
        if (swiper.params.observeParents) {
          const containerParents = swiper.$el.parents();
          for (let i = 0; i < containerParents.length; i += 1) {
            swiper.observer.attach(containerParents[i]);
          }
        }
        // Observe container
        swiper.observer.attach(swiper.$el[0], { childList: swiper.params.observeSlideChildren });

        // Observe wrapper
        swiper.observer.attach(swiper.$wrapperEl[0], { attributes: false });
      },
      destroy() {
        const swiper = this;
        swiper.observer.observers.forEach((observer) => {
          observer.disconnect();
        });
        swiper.observer.observers = [];
      },
    };

    var Observer$1 = {
      name: 'observer',
      params: {
        observer: false,
        observeParents: false,
        observeSlideChildren: false,
      },
      create() {
        const swiper = this;
        Utils.extend(swiper, {
          observer: {
            init: Observer.init.bind(swiper),
            attach: Observer.attach.bind(swiper),
            destroy: Observer.destroy.bind(swiper),
            observers: [],
          },
        });
      },
      on: {
        init() {
          const swiper = this;
          swiper.observer.init();
        },
        destroy() {
          const swiper = this;
          swiper.observer.destroy();
        },
      },
    };

    const Virtual = {
      update(force) {
        const swiper = this;
        const { slidesPerView, slidesPerGroup, centeredSlides } = swiper.params;
        const { addSlidesBefore, addSlidesAfter } = swiper.params.virtual;
        const {
          from: previousFrom,
          to: previousTo,
          slides,
          slidesGrid: previousSlidesGrid,
          renderSlide,
          offset: previousOffset,
        } = swiper.virtual;
        swiper.updateActiveIndex();
        const activeIndex = swiper.activeIndex || 0;

        let offsetProp;
        if (swiper.rtlTranslate) offsetProp = 'right';
        else offsetProp = swiper.isHorizontal() ? 'left' : 'top';

        let slidesAfter;
        let slidesBefore;
        if (centeredSlides) {
          slidesAfter = Math.floor(slidesPerView / 2) + slidesPerGroup + addSlidesBefore;
          slidesBefore = Math.floor(slidesPerView / 2) + slidesPerGroup + addSlidesAfter;
        } else {
          slidesAfter = slidesPerView + (slidesPerGroup - 1) + addSlidesBefore;
          slidesBefore = slidesPerGroup + addSlidesAfter;
        }
        const from = Math.max((activeIndex || 0) - slidesBefore, 0);
        const to = Math.min((activeIndex || 0) + slidesAfter, slides.length - 1);
        const offset = (swiper.slidesGrid[from] || 0) - (swiper.slidesGrid[0] || 0);

        Utils.extend(swiper.virtual, {
          from,
          to,
          offset,
          slidesGrid: swiper.slidesGrid,
        });

        function onRendered() {
          swiper.updateSlides();
          swiper.updateProgress();
          swiper.updateSlidesClasses();
          if (swiper.lazy && swiper.params.lazy.enabled) {
            swiper.lazy.load();
          }
        }

        if (previousFrom === from && previousTo === to && !force) {
          if (swiper.slidesGrid !== previousSlidesGrid && offset !== previousOffset) {
            swiper.slides.css(offsetProp, `${offset}px`);
          }
          swiper.updateProgress();
          return;
        }
        if (swiper.params.virtual.renderExternal) {
          swiper.params.virtual.renderExternal.call(swiper, {
            offset,
            from,
            to,
            slides: (function getSlides() {
              const slidesToRender = [];
              for (let i = from; i <= to; i += 1) {
                slidesToRender.push(slides[i]);
              }
              return slidesToRender;
            }()),
          });
          onRendered();
          return;
        }
        const prependIndexes = [];
        const appendIndexes = [];
        if (force) {
          swiper.$wrapperEl.find(`.${swiper.params.slideClass}`).remove();
        } else {
          for (let i = previousFrom; i <= previousTo; i += 1) {
            if (i < from || i > to) {
              swiper.$wrapperEl.find(`.${swiper.params.slideClass}[data-swiper-slide-index="${i}"]`).remove();
            }
          }
        }
        for (let i = 0; i < slides.length; i += 1) {
          if (i >= from && i <= to) {
            if (typeof previousTo === 'undefined' || force) {
              appendIndexes.push(i);
            } else {
              if (i > previousTo) appendIndexes.push(i);
              if (i < previousFrom) prependIndexes.push(i);
            }
          }
        }
        appendIndexes.forEach((index) => {
          swiper.$wrapperEl.append(renderSlide(slides[index], index));
        });
        prependIndexes.sort((a, b) => b - a).forEach((index) => {
          swiper.$wrapperEl.prepend(renderSlide(slides[index], index));
        });
        swiper.$wrapperEl.children('.swiper-slide').css(offsetProp, `${offset}px`);
        onRendered();
      },
      renderSlide(slide, index) {
        const swiper = this;
        const params = swiper.params.virtual;
        if (params.cache && swiper.virtual.cache[index]) {
          return swiper.virtual.cache[index];
        }
        const $slideEl = params.renderSlide
          ? $(params.renderSlide.call(swiper, slide, index))
          : $(`<div class="${swiper.params.slideClass}" data-swiper-slide-index="${index}">${slide}</div>`);
        if (!$slideEl.attr('data-swiper-slide-index')) $slideEl.attr('data-swiper-slide-index', index);
        if (params.cache) swiper.virtual.cache[index] = $slideEl;
        return $slideEl;
      },
      appendSlide(slides) {
        const swiper = this;
        if (typeof slides === 'object' && 'length' in slides) {
          for (let i = 0; i < slides.length; i += 1) {
            if (slides[i]) swiper.virtual.slides.push(slides[i]);
          }
        } else {
          swiper.virtual.slides.push(slides);
        }
        swiper.virtual.update(true);
      },
      prependSlide(slides) {
        const swiper = this;
        const activeIndex = swiper.activeIndex;
        let newActiveIndex = activeIndex + 1;
        let numberOfNewSlides = 1;

        if (Array.isArray(slides)) {
          for (let i = 0; i < slides.length; i += 1) {
            if (slides[i]) swiper.virtual.slides.unshift(slides[i]);
          }
          newActiveIndex = activeIndex + slides.length;
          numberOfNewSlides = slides.length;
        } else {
          swiper.virtual.slides.unshift(slides);
        }
        if (swiper.params.virtual.cache) {
          const cache = swiper.virtual.cache;
          const newCache = {};
          Object.keys(cache).forEach((cachedIndex) => {
            newCache[parseInt(cachedIndex, 10) + numberOfNewSlides] = cache[cachedIndex];
          });
          swiper.virtual.cache = newCache;
        }
        swiper.virtual.update(true);
        swiper.slideTo(newActiveIndex, 0);
      },
      removeSlide(slidesIndexes) {
        const swiper = this;
        if (typeof slidesIndexes === 'undefined' || slidesIndexes === null) return;
        let activeIndex = swiper.activeIndex;
        if (Array.isArray(slidesIndexes)) {
          for (let i = slidesIndexes.length - 1; i >= 0; i -= 1) {
            swiper.virtual.slides.splice(slidesIndexes[i], 1);
            if (swiper.params.virtual.cache) {
              delete swiper.virtual.cache[slidesIndexes[i]];
            }
            if (slidesIndexes[i] < activeIndex) activeIndex -= 1;
            activeIndex = Math.max(activeIndex, 0);
          }
        } else {
          swiper.virtual.slides.splice(slidesIndexes, 1);
          if (swiper.params.virtual.cache) {
            delete swiper.virtual.cache[slidesIndexes];
          }
          if (slidesIndexes < activeIndex) activeIndex -= 1;
          activeIndex = Math.max(activeIndex, 0);
        }
        swiper.virtual.update(true);
        swiper.slideTo(activeIndex, 0);
      },
      removeAllSlides() {
        const swiper = this;
        swiper.virtual.slides = [];
        if (swiper.params.virtual.cache) {
          swiper.virtual.cache = {};
        }
        swiper.virtual.update(true);
        swiper.slideTo(0, 0);
      },
    };

    var Virtual$1 = {
      name: 'virtual',
      params: {
        virtual: {
          enabled: false,
          slides: [],
          cache: true,
          renderSlide: null,
          renderExternal: null,
          addSlidesBefore: 0,
          addSlidesAfter: 0,
        },
      },
      create() {
        const swiper = this;
        Utils.extend(swiper, {
          virtual: {
            update: Virtual.update.bind(swiper),
            appendSlide: Virtual.appendSlide.bind(swiper),
            prependSlide: Virtual.prependSlide.bind(swiper),
            removeSlide: Virtual.removeSlide.bind(swiper),
            removeAllSlides: Virtual.removeAllSlides.bind(swiper),
            renderSlide: Virtual.renderSlide.bind(swiper),
            slides: swiper.params.virtual.slides,
            cache: {},
          },
        });
      },
      on: {
        beforeInit() {
          const swiper = this;
          if (!swiper.params.virtual.enabled) return;
          swiper.classNames.push(`${swiper.params.containerModifierClass}virtual`);
          const overwriteParams = {
            watchSlidesProgress: true,
          };
          Utils.extend(swiper.params, overwriteParams);
          Utils.extend(swiper.originalParams, overwriteParams);

          if (!swiper.params.initialSlide) {
            swiper.virtual.update();
          }
        },
        setTranslate() {
          const swiper = this;
          if (!swiper.params.virtual.enabled) return;
          swiper.virtual.update();
        },
      },
    };

    const Keyboard = {
      handle(event) {
        const swiper = this;
        const { rtlTranslate: rtl } = swiper;
        let e = event;
        if (e.originalEvent) e = e.originalEvent; // jquery fix
        const kc = e.keyCode || e.charCode;
        // Directions locks
        if (!swiper.allowSlideNext && ((swiper.isHorizontal() && kc === 39) || (swiper.isVertical() && kc === 40) || kc === 34)) {
          return false;
        }
        if (!swiper.allowSlidePrev && ((swiper.isHorizontal() && kc === 37) || (swiper.isVertical() && kc === 38) || kc === 33)) {
          return false;
        }
        if (e.shiftKey || e.altKey || e.ctrlKey || e.metaKey) {
          return undefined;
        }
        if (doc.activeElement && doc.activeElement.nodeName && (doc.activeElement.nodeName.toLowerCase() === 'input' || doc.activeElement.nodeName.toLowerCase() === 'textarea')) {
          return undefined;
        }
        if (swiper.params.keyboard.onlyInViewport && (kc === 33 || kc === 34 || kc === 37 || kc === 39 || kc === 38 || kc === 40)) {
          let inView = false;
          // Check that swiper should be inside of visible area of window
          if (swiper.$el.parents(`.${swiper.params.slideClass}`).length > 0 && swiper.$el.parents(`.${swiper.params.slideActiveClass}`).length === 0) {
            return undefined;
          }
          const windowWidth = win.innerWidth;
          const windowHeight = win.innerHeight;
          const swiperOffset = swiper.$el.offset();
          if (rtl) swiperOffset.left -= swiper.$el[0].scrollLeft;
          const swiperCoord = [
            [swiperOffset.left, swiperOffset.top],
            [swiperOffset.left + swiper.width, swiperOffset.top],
            [swiperOffset.left, swiperOffset.top + swiper.height],
            [swiperOffset.left + swiper.width, swiperOffset.top + swiper.height],
          ];
          for (let i = 0; i < swiperCoord.length; i += 1) {
            const point = swiperCoord[i];
            if (
              point[0] >= 0 && point[0] <= windowWidth
              && point[1] >= 0 && point[1] <= windowHeight
            ) {
              inView = true;
            }
          }
          if (!inView) return undefined;
        }
        if (swiper.isHorizontal()) {
          if (kc === 33 || kc === 34 || kc === 37 || kc === 39) {
            if (e.preventDefault) e.preventDefault();
            else e.returnValue = false;
          }
          if (((kc === 34 || kc === 39) && !rtl) || ((kc === 33 || kc === 37) && rtl)) swiper.slideNext();
          if (((kc === 33 || kc === 37) && !rtl) || ((kc === 34 || kc === 39) && rtl)) swiper.slidePrev();
        } else {
          if (kc === 33 || kc === 34 || kc === 38 || kc === 40) {
            if (e.preventDefault) e.preventDefault();
            else e.returnValue = false;
          }
          if (kc === 34 || kc === 40) swiper.slideNext();
          if (kc === 33 || kc === 38) swiper.slidePrev();
        }
        swiper.emit('keyPress', kc);
        return undefined;
      },
      enable() {
        const swiper = this;
        if (swiper.keyboard.enabled) return;
        $(doc).on('keydown', swiper.keyboard.handle);
        swiper.keyboard.enabled = true;
      },
      disable() {
        const swiper = this;
        if (!swiper.keyboard.enabled) return;
        $(doc).off('keydown', swiper.keyboard.handle);
        swiper.keyboard.enabled = false;
      },
    };

    var Keyboard$1 = {
      name: 'keyboard',
      params: {
        keyboard: {
          enabled: false,
          onlyInViewport: true,
        },
      },
      create() {
        const swiper = this;
        Utils.extend(swiper, {
          keyboard: {
            enabled: false,
            enable: Keyboard.enable.bind(swiper),
            disable: Keyboard.disable.bind(swiper),
            handle: Keyboard.handle.bind(swiper),
          },
        });
      },
      on: {
        init() {
          const swiper = this;
          if (swiper.params.keyboard.enabled) {
            swiper.keyboard.enable();
          }
        },
        destroy() {
          const swiper = this;
          if (swiper.keyboard.enabled) {
            swiper.keyboard.disable();
          }
        },
      },
    };

    function isEventSupported() {
      const eventName = 'onwheel';
      let isSupported = eventName in doc;

      if (!isSupported) {
        const element = doc.createElement('div');
        element.setAttribute(eventName, 'return;');
        isSupported = typeof element[eventName] === 'function';
      }

      if (!isSupported
        && doc.implementation
        && doc.implementation.hasFeature
        // always returns true in newer browsers as per the standard.
        // @see http://dom.spec.whatwg.org/#dom-domimplementation-hasfeature
        && doc.implementation.hasFeature('', '') !== true
      ) {
        // This is the only way to test support for the `wheel` event in IE9+.
        isSupported = doc.implementation.hasFeature('Events.wheel', '3.0');
      }

      return isSupported;
    }
    const Mousewheel = {
      lastScrollTime: Utils.now(),
      event: (function getEvent() {
        if (win.navigator.userAgent.indexOf('firefox') > -1) return 'DOMMouseScroll';
        return isEventSupported() ? 'wheel' : 'mousewheel';
      }()),
      normalize(e) {
        // Reasonable defaults
        const PIXEL_STEP = 10;
        const LINE_HEIGHT = 40;
        const PAGE_HEIGHT = 800;

        let sX = 0;
        let sY = 0; // spinX, spinY
        let pX = 0;
        let pY = 0; // pixelX, pixelY

        // Legacy
        if ('detail' in e) {
          sY = e.detail;
        }
        if ('wheelDelta' in e) {
          sY = -e.wheelDelta / 120;
        }
        if ('wheelDeltaY' in e) {
          sY = -e.wheelDeltaY / 120;
        }
        if ('wheelDeltaX' in e) {
          sX = -e.wheelDeltaX / 120;
        }

        // side scrolling on FF with DOMMouseScroll
        if ('axis' in e && e.axis === e.HORIZONTAL_AXIS) {
          sX = sY;
          sY = 0;
        }

        pX = sX * PIXEL_STEP;
        pY = sY * PIXEL_STEP;

        if ('deltaY' in e) {
          pY = e.deltaY;
        }
        if ('deltaX' in e) {
          pX = e.deltaX;
        }

        if ((pX || pY) && e.deltaMode) {
          if (e.deltaMode === 1) { // delta in LINE units
            pX *= LINE_HEIGHT;
            pY *= LINE_HEIGHT;
          } else { // delta in PAGE units
            pX *= PAGE_HEIGHT;
            pY *= PAGE_HEIGHT;
          }
        }

        // Fall-back if spin cannot be determined
        if (pX && !sX) {
          sX = (pX < 1) ? -1 : 1;
        }
        if (pY && !sY) {
          sY = (pY < 1) ? -1 : 1;
        }

        return {
          spinX: sX,
          spinY: sY,
          pixelX: pX,
          pixelY: pY,
        };
      },
      handleMouseEnter() {
        const swiper = this;
        swiper.mouseEntered = true;
      },
      handleMouseLeave() {
        const swiper = this;
        swiper.mouseEntered = false;
      },
      handle(event) {
        let e = event;
        const swiper = this;
        const params = swiper.params.mousewheel;

        if (!swiper.mouseEntered && !params.releaseOnEdges) return true;

        if (e.originalEvent) e = e.originalEvent; // jquery fix
        let delta = 0;
        const rtlFactor = swiper.rtlTranslate ? -1 : 1;

        const data = Mousewheel.normalize(e);

        if (params.forceToAxis) {
          if (swiper.isHorizontal()) {
            if (Math.abs(data.pixelX) > Math.abs(data.pixelY)) delta = data.pixelX * rtlFactor;
            else return true;
          } else if (Math.abs(data.pixelY) > Math.abs(data.pixelX)) delta = data.pixelY;
          else return true;
        } else {
          delta = Math.abs(data.pixelX) > Math.abs(data.pixelY) ? -data.pixelX * rtlFactor : -data.pixelY;
        }

        if (delta === 0) return true;

        if (params.invert) delta = -delta;

        if (!swiper.params.freeMode) {
          if (Utils.now() - swiper.mousewheel.lastScrollTime > 60) {
            if (delta < 0) {
              if ((!swiper.isEnd || swiper.params.loop) && !swiper.animating) {
                swiper.slideNext();
                swiper.emit('scroll', e);
              } else if (params.releaseOnEdges) return true;
            } else if ((!swiper.isBeginning || swiper.params.loop) && !swiper.animating) {
              swiper.slidePrev();
              swiper.emit('scroll', e);
            } else if (params.releaseOnEdges) return true;
          }
          swiper.mousewheel.lastScrollTime = (new win.Date()).getTime();
        } else {
          // Freemode or scrollContainer:
          if (swiper.params.loop) {
            swiper.loopFix();
          }
          let position = swiper.getTranslate() + (delta * params.sensitivity);
          const wasBeginning = swiper.isBeginning;
          const wasEnd = swiper.isEnd;

          if (position >= swiper.minTranslate()) position = swiper.minTranslate();
          if (position <= swiper.maxTranslate()) position = swiper.maxTranslate();

          swiper.setTransition(0);
          swiper.setTranslate(position);
          swiper.updateProgress();
          swiper.updateActiveIndex();
          swiper.updateSlidesClasses();

          if ((!wasBeginning && swiper.isBeginning) || (!wasEnd && swiper.isEnd)) {
            swiper.updateSlidesClasses();
          }

          if (swiper.params.freeModeSticky) {
            clearTimeout(swiper.mousewheel.timeout);
            swiper.mousewheel.timeout = Utils.nextTick(() => {
              swiper.slideToClosest();
            }, 300);
          }
          // Emit event
          swiper.emit('scroll', e);

          // Stop autoplay
          if (swiper.params.autoplay && swiper.params.autoplayDisableOnInteraction) swiper.autoplay.stop();
          // Return page scroll on edge positions
          if (position === swiper.minTranslate() || position === swiper.maxTranslate()) return true;
        }

        if (e.preventDefault) e.preventDefault();
        else e.returnValue = false;
        return false;
      },
      enable() {
        const swiper = this;
        if (!Mousewheel.event) return false;
        if (swiper.mousewheel.enabled) return false;
        let target = swiper.$el;
        if (swiper.params.mousewheel.eventsTarged !== 'container') {
          target = $(swiper.params.mousewheel.eventsTarged);
        }
        target.on('mouseenter', swiper.mousewheel.handleMouseEnter);
        target.on('mouseleave', swiper.mousewheel.handleMouseLeave);
        target.on(Mousewheel.event, swiper.mousewheel.handle);
        swiper.mousewheel.enabled = true;
        return true;
      },
      disable() {
        const swiper = this;
        if (!Mousewheel.event) return false;
        if (!swiper.mousewheel.enabled) return false;
        let target = swiper.$el;
        if (swiper.params.mousewheel.eventsTarged !== 'container') {
          target = $(swiper.params.mousewheel.eventsTarged);
        }
        target.off(Mousewheel.event, swiper.mousewheel.handle);
        swiper.mousewheel.enabled = false;
        return true;
      },
    };

    var Mousewheel$1 = {
      name: 'mousewheel',
      params: {
        mousewheel: {
          enabled: false,
          releaseOnEdges: false,
          invert: false,
          forceToAxis: false,
          sensitivity: 1,
          eventsTarged: 'container',
        },
      },
      create() {
        const swiper = this;
        Utils.extend(swiper, {
          mousewheel: {
            enabled: false,
            enable: Mousewheel.enable.bind(swiper),
            disable: Mousewheel.disable.bind(swiper),
            handle: Mousewheel.handle.bind(swiper),
            handleMouseEnter: Mousewheel.handleMouseEnter.bind(swiper),
            handleMouseLeave: Mousewheel.handleMouseLeave.bind(swiper),
            lastScrollTime: Utils.now(),
          },
        });
      },
      on: {
        init() {
          const swiper = this;
          if (swiper.params.mousewheel.enabled) swiper.mousewheel.enable();
        },
        destroy() {
          const swiper = this;
          if (swiper.mousewheel.enabled) swiper.mousewheel.disable();
        },
      },
    };

    const Navigation = {
      update() {
        // Update Navigation Buttons
        const swiper = this;
        const params = swiper.params.navigation;

        if (swiper.params.loop) return;
        const { $nextEl, $prevEl } = swiper.navigation;

        if ($prevEl && $prevEl.length > 0) {
          if (swiper.isBeginning) {
            $prevEl.addClass(params.disabledClass);
          } else {
            $prevEl.removeClass(params.disabledClass);
          }
          $prevEl[swiper.params.watchOverflow && swiper.isLocked ? 'addClass' : 'removeClass'](params.lockClass);
        }
        if ($nextEl && $nextEl.length > 0) {
          if (swiper.isEnd) {
            $nextEl.addClass(params.disabledClass);
          } else {
            $nextEl.removeClass(params.disabledClass);
          }
          $nextEl[swiper.params.watchOverflow && swiper.isLocked ? 'addClass' : 'removeClass'](params.lockClass);
        }
      },
      onPrevClick(e) {
        const swiper = this;
        e.preventDefault();
        if (swiper.isBeginning && !swiper.params.loop) return;
        swiper.slidePrev();
      },
      onNextClick(e) {
        const swiper = this;
        e.preventDefault();
        if (swiper.isEnd && !swiper.params.loop) return;
        swiper.slideNext();
      },
      init() {
        const swiper = this;
        const params = swiper.params.navigation;
        if (!(params.nextEl || params.prevEl)) return;

        let $nextEl;
        let $prevEl;
        if (params.nextEl) {
          $nextEl = $(params.nextEl);
          if (
            swiper.params.uniqueNavElements
            && typeof params.nextEl === 'string'
            && $nextEl.length > 1
            && swiper.$el.find(params.nextEl).length === 1
          ) {
            $nextEl = swiper.$el.find(params.nextEl);
          }
        }
        if (params.prevEl) {
          $prevEl = $(params.prevEl);
          if (
            swiper.params.uniqueNavElements
            && typeof params.prevEl === 'string'
            && $prevEl.length > 1
            && swiper.$el.find(params.prevEl).length === 1
          ) {
            $prevEl = swiper.$el.find(params.prevEl);
          }
        }

        if ($nextEl && $nextEl.length > 0) {
          $nextEl.on('click', swiper.navigation.onNextClick);
        }
        if ($prevEl && $prevEl.length > 0) {
          $prevEl.on('click', swiper.navigation.onPrevClick);
        }

        Utils.extend(swiper.navigation, {
          $nextEl,
          nextEl: $nextEl && $nextEl[0],
          $prevEl,
          prevEl: $prevEl && $prevEl[0],
        });
      },
      destroy() {
        const swiper = this;
        const { $nextEl, $prevEl } = swiper.navigation;
        if ($nextEl && $nextEl.length) {
          $nextEl.off('click', swiper.navigation.onNextClick);
          $nextEl.removeClass(swiper.params.navigation.disabledClass);
        }
        if ($prevEl && $prevEl.length) {
          $prevEl.off('click', swiper.navigation.onPrevClick);
          $prevEl.removeClass(swiper.params.navigation.disabledClass);
        }
      },
    };

    var Navigation$1 = {
      name: 'navigation',
      params: {
        navigation: {
          nextEl: null,
          prevEl: null,

          hideOnClick: false,
          disabledClass: 'swiper-button-disabled',
          hiddenClass: 'swiper-button-hidden',
          lockClass: 'swiper-button-lock',
        },
      },
      create() {
        const swiper = this;
        Utils.extend(swiper, {
          navigation: {
            init: Navigation.init.bind(swiper),
            update: Navigation.update.bind(swiper),
            destroy: Navigation.destroy.bind(swiper),
            onNextClick: Navigation.onNextClick.bind(swiper),
            onPrevClick: Navigation.onPrevClick.bind(swiper),
          },
        });
      },
      on: {
        init() {
          const swiper = this;
          swiper.navigation.init();
          swiper.navigation.update();
        },
        toEdge() {
          const swiper = this;
          swiper.navigation.update();
        },
        fromEdge() {
          const swiper = this;
          swiper.navigation.update();
        },
        destroy() {
          const swiper = this;
          swiper.navigation.destroy();
        },
        click(e) {
          const swiper = this;
          const { $nextEl, $prevEl } = swiper.navigation;
          if (
            swiper.params.navigation.hideOnClick
            && !$(e.target).is($prevEl)
            && !$(e.target).is($nextEl)
          ) {
            let isHidden;
            if ($nextEl) {
              isHidden = $nextEl.hasClass(swiper.params.navigation.hiddenClass);
            } else if ($prevEl) {
              isHidden = $prevEl.hasClass(swiper.params.navigation.hiddenClass);
            }
            if (isHidden === true) {
              swiper.emit('navigationShow', swiper);
            } else {
              swiper.emit('navigationHide', swiper);
            }
            if ($nextEl) {
              $nextEl.toggleClass(swiper.params.navigation.hiddenClass);
            }
            if ($prevEl) {
              $prevEl.toggleClass(swiper.params.navigation.hiddenClass);
            }
          }
        },
      },
    };

    const Pagination = {
      update() {
        // Render || Update Pagination bullets/items
        const swiper = this;
        const rtl = swiper.rtl;
        const params = swiper.params.pagination;
        if (!params.el || !swiper.pagination.el || !swiper.pagination.$el || swiper.pagination.$el.length === 0) return;
        const slidesLength = swiper.virtual && swiper.params.virtual.enabled ? swiper.virtual.slides.length : swiper.slides.length;
        const $el = swiper.pagination.$el;
        // Current/Total
        let current;
        const total = swiper.params.loop ? Math.ceil((slidesLength - (swiper.loopedSlides * 2)) / swiper.params.slidesPerGroup) : swiper.snapGrid.length;
        if (swiper.params.loop) {
          current = Math.ceil((swiper.activeIndex - swiper.loopedSlides) / swiper.params.slidesPerGroup);
          if (current > slidesLength - 1 - (swiper.loopedSlides * 2)) {
            current -= (slidesLength - (swiper.loopedSlides * 2));
          }
          if (current > total - 1) current -= total;
          if (current < 0 && swiper.params.paginationType !== 'bullets') current = total + current;
        } else if (typeof swiper.snapIndex !== 'undefined') {
          current = swiper.snapIndex;
        } else {
          current = swiper.activeIndex || 0;
        }
        // Types
        if (params.type === 'bullets' && swiper.pagination.bullets && swiper.pagination.bullets.length > 0) {
          const bullets = swiper.pagination.bullets;
          let firstIndex;
          let lastIndex;
          let midIndex;
          if (params.dynamicBullets) {
            swiper.pagination.bulletSize = bullets.eq(0)[swiper.isHorizontal() ? 'outerWidth' : 'outerHeight'](true);
            $el.css(swiper.isHorizontal() ? 'width' : 'height', `${swiper.pagination.bulletSize * (params.dynamicMainBullets + 4)}px`);
            if (params.dynamicMainBullets > 1 && swiper.previousIndex !== undefined) {
              swiper.pagination.dynamicBulletIndex += (current - swiper.previousIndex);
              if (swiper.pagination.dynamicBulletIndex > (params.dynamicMainBullets - 1)) {
                swiper.pagination.dynamicBulletIndex = params.dynamicMainBullets - 1;
              } else if (swiper.pagination.dynamicBulletIndex < 0) {
                swiper.pagination.dynamicBulletIndex = 0;
              }
            }
            firstIndex = current - swiper.pagination.dynamicBulletIndex;
            lastIndex = firstIndex + (Math.min(bullets.length, params.dynamicMainBullets) - 1);
            midIndex = (lastIndex + firstIndex) / 2;
          }
          bullets.removeClass(`${params.bulletActiveClass} ${params.bulletActiveClass}-next ${params.bulletActiveClass}-next-next ${params.bulletActiveClass}-prev ${params.bulletActiveClass}-prev-prev ${params.bulletActiveClass}-main`);
          if ($el.length > 1) {
            bullets.each((index, bullet) => {
              const $bullet = $(bullet);
              const bulletIndex = $bullet.index();
              if (bulletIndex === current) {
                $bullet.addClass(params.bulletActiveClass);
              }
              if (params.dynamicBullets) {
                if (bulletIndex >= firstIndex && bulletIndex <= lastIndex) {
                  $bullet.addClass(`${params.bulletActiveClass}-main`);
                }
                if (bulletIndex === firstIndex) {
                  $bullet
                    .prev()
                    .addClass(`${params.bulletActiveClass}-prev`)
                    .prev()
                    .addClass(`${params.bulletActiveClass}-prev-prev`);
                }
                if (bulletIndex === lastIndex) {
                  $bullet
                    .next()
                    .addClass(`${params.bulletActiveClass}-next`)
                    .next()
                    .addClass(`${params.bulletActiveClass}-next-next`);
                }
              }
            });
          } else {
            const $bullet = bullets.eq(current);
            $bullet.addClass(params.bulletActiveClass);
            if (params.dynamicBullets) {
              const $firstDisplayedBullet = bullets.eq(firstIndex);
              const $lastDisplayedBullet = bullets.eq(lastIndex);
              for (let i = firstIndex; i <= lastIndex; i += 1) {
                bullets.eq(i).addClass(`${params.bulletActiveClass}-main`);
              }
              $firstDisplayedBullet
                .prev()
                .addClass(`${params.bulletActiveClass}-prev`)
                .prev()
                .addClass(`${params.bulletActiveClass}-prev-prev`);
              $lastDisplayedBullet
                .next()
                .addClass(`${params.bulletActiveClass}-next`)
                .next()
                .addClass(`${params.bulletActiveClass}-next-next`);
            }
          }
          if (params.dynamicBullets) {
            const dynamicBulletsLength = Math.min(bullets.length, params.dynamicMainBullets + 4);
            const bulletsOffset = (((swiper.pagination.bulletSize * dynamicBulletsLength) - (swiper.pagination.bulletSize)) / 2) - (midIndex * swiper.pagination.bulletSize);
            const offsetProp = rtl ? 'right' : 'left';
            bullets.css(swiper.isHorizontal() ? offsetProp : 'top', `${bulletsOffset}px`);
          }
        }
        if (params.type === 'fraction') {
          $el.find(`.${params.currentClass}`).text(params.formatFractionCurrent(current + 1));
          $el.find(`.${params.totalClass}`).text(params.formatFractionTotal(total));
        }
        if (params.type === 'progressbar') {
          let progressbarDirection;
          if (params.progressbarOpposite) {
            progressbarDirection = swiper.isHorizontal() ? 'vertical' : 'horizontal';
          } else {
            progressbarDirection = swiper.isHorizontal() ? 'horizontal' : 'vertical';
          }
          const scale = (current + 1) / total;
          let scaleX = 1;
          let scaleY = 1;
          if (progressbarDirection === 'horizontal') {
            scaleX = scale;
          } else {
            scaleY = scale;
          }
          $el.find(`.${params.progressbarFillClass}`).transform(`translate3d(0,0,0) scaleX(${scaleX}) scaleY(${scaleY})`).transition(swiper.params.speed);
        }
        if (params.type === 'custom' && params.renderCustom) {
          $el.html(params.renderCustom(swiper, current + 1, total));
          swiper.emit('paginationRender', swiper, $el[0]);
        } else {
          swiper.emit('paginationUpdate', swiper, $el[0]);
        }
        $el[swiper.params.watchOverflow && swiper.isLocked ? 'addClass' : 'removeClass'](params.lockClass);
      },
      render() {
        // Render Container
        const swiper = this;
        const params = swiper.params.pagination;
        if (!params.el || !swiper.pagination.el || !swiper.pagination.$el || swiper.pagination.$el.length === 0) return;
        const slidesLength = swiper.virtual && swiper.params.virtual.enabled ? swiper.virtual.slides.length : swiper.slides.length;

        const $el = swiper.pagination.$el;
        let paginationHTML = '';
        if (params.type === 'bullets') {
          const numberOfBullets = swiper.params.loop ? Math.ceil((slidesLength - (swiper.loopedSlides * 2)) / swiper.params.slidesPerGroup) : swiper.snapGrid.length;
          for (let i = 0; i < numberOfBullets; i += 1) {
            if (params.renderBullet) {
              paginationHTML += params.renderBullet.call(swiper, i, params.bulletClass);
            } else {
              paginationHTML += `<${params.bulletElement} class="${params.bulletClass}"></${params.bulletElement}>`;
            }
          }
          $el.html(paginationHTML);
          swiper.pagination.bullets = $el.find(`.${params.bulletClass}`);
        }
        if (params.type === 'fraction') {
          if (params.renderFraction) {
            paginationHTML = params.renderFraction.call(swiper, params.currentClass, params.totalClass);
          } else {
            paginationHTML = `<span class="${params.currentClass}"></span>`
            + ' / '
            + `<span class="${params.totalClass}"></span>`;
          }
          $el.html(paginationHTML);
        }
        if (params.type === 'progressbar') {
          if (params.renderProgressbar) {
            paginationHTML = params.renderProgressbar.call(swiper, params.progressbarFillClass);
          } else {
            paginationHTML = `<span class="${params.progressbarFillClass}"></span>`;
          }
          $el.html(paginationHTML);
        }
        if (params.type !== 'custom') {
          swiper.emit('paginationRender', swiper.pagination.$el[0]);
        }
      },
      init() {
        const swiper = this;
        const params = swiper.params.pagination;
        if (!params.el) return;

        let $el = $(params.el);
        if ($el.length === 0) return;

        if (
          swiper.params.uniqueNavElements
          && typeof params.el === 'string'
          && $el.length > 1
          && swiper.$el.find(params.el).length === 1
        ) {
          $el = swiper.$el.find(params.el);
        }

        if (params.type === 'bullets' && params.clickable) {
          $el.addClass(params.clickableClass);
        }

        $el.addClass(params.modifierClass + params.type);

        if (params.type === 'bullets' && params.dynamicBullets) {
          $el.addClass(`${params.modifierClass}${params.type}-dynamic`);
          swiper.pagination.dynamicBulletIndex = 0;
          if (params.dynamicMainBullets < 1) {
            params.dynamicMainBullets = 1;
          }
        }
        if (params.type === 'progressbar' && params.progressbarOpposite) {
          $el.addClass(params.progressbarOppositeClass);
        }

        if (params.clickable) {
          $el.on('click', `.${params.bulletClass}`, function onClick(e) {
            e.preventDefault();
            let index = $(this).index() * swiper.params.slidesPerGroup;
            if (swiper.params.loop) index += swiper.loopedSlides;
            swiper.slideTo(index);
          });
        }

        Utils.extend(swiper.pagination, {
          $el,
          el: $el[0],
        });
      },
      destroy() {
        const swiper = this;
        const params = swiper.params.pagination;
        if (!params.el || !swiper.pagination.el || !swiper.pagination.$el || swiper.pagination.$el.length === 0) return;
        const $el = swiper.pagination.$el;

        $el.removeClass(params.hiddenClass);
        $el.removeClass(params.modifierClass + params.type);
        if (swiper.pagination.bullets) swiper.pagination.bullets.removeClass(params.bulletActiveClass);
        if (params.clickable) {
          $el.off('click', `.${params.bulletClass}`);
        }
      },
    };

    var Pagination$1 = {
      name: 'pagination',
      params: {
        pagination: {
          el: null,
          bulletElement: 'span',
          clickable: false,
          hideOnClick: false,
          renderBullet: null,
          renderProgressbar: null,
          renderFraction: null,
          renderCustom: null,
          progressbarOpposite: false,
          type: 'bullets', // 'bullets' or 'progressbar' or 'fraction' or 'custom'
          dynamicBullets: false,
          dynamicMainBullets: 1,
          formatFractionCurrent: (number) => number,
          formatFractionTotal: (number) => number,
          bulletClass: 'swiper-pagination-bullet',
          bulletActiveClass: 'swiper-pagination-bullet-active',
          modifierClass: 'swiper-pagination-', // NEW
          currentClass: 'swiper-pagination-current',
          totalClass: 'swiper-pagination-total',
          hiddenClass: 'swiper-pagination-hidden',
          progressbarFillClass: 'swiper-pagination-progressbar-fill',
          progressbarOppositeClass: 'swiper-pagination-progressbar-opposite',
          clickableClass: 'swiper-pagination-clickable', // NEW
          lockClass: 'swiper-pagination-lock',
        },
      },
      create() {
        const swiper = this;
        Utils.extend(swiper, {
          pagination: {
            init: Pagination.init.bind(swiper),
            render: Pagination.render.bind(swiper),
            update: Pagination.update.bind(swiper),
            destroy: Pagination.destroy.bind(swiper),
            dynamicBulletIndex: 0,
          },
        });
      },
      on: {
        init() {
          const swiper = this;
          swiper.pagination.init();
          swiper.pagination.render();
          swiper.pagination.update();
        },
        activeIndexChange() {
          const swiper = this;
          if (swiper.params.loop) {
            swiper.pagination.update();
          } else if (typeof swiper.snapIndex === 'undefined') {
            swiper.pagination.update();
          }
        },
        snapIndexChange() {
          const swiper = this;
          if (!swiper.params.loop) {
            swiper.pagination.update();
          }
        },
        slidesLengthChange() {
          const swiper = this;
          if (swiper.params.loop) {
            swiper.pagination.render();
            swiper.pagination.update();
          }
        },
        snapGridLengthChange() {
          const swiper = this;
          if (!swiper.params.loop) {
            swiper.pagination.render();
            swiper.pagination.update();
          }
        },
        destroy() {
          const swiper = this;
          swiper.pagination.destroy();
        },
        click(e) {
          const swiper = this;
          if (
            swiper.params.pagination.el
            && swiper.params.pagination.hideOnClick
            && swiper.pagination.$el.length > 0
            && !$(e.target).hasClass(swiper.params.pagination.bulletClass)
          ) {
            const isHidden = swiper.pagination.$el.hasClass(swiper.params.pagination.hiddenClass);
            if (isHidden === true) {
              swiper.emit('paginationShow', swiper);
            } else {
              swiper.emit('paginationHide', swiper);
            }
            swiper.pagination.$el.toggleClass(swiper.params.pagination.hiddenClass);
          }
        },
      },
    };

    const Scrollbar = {
      setTranslate() {
        const swiper = this;
        if (!swiper.params.scrollbar.el || !swiper.scrollbar.el) return;
        const { scrollbar, rtlTranslate: rtl, progress } = swiper;
        const {
          dragSize, trackSize, $dragEl, $el,
        } = scrollbar;
        const params = swiper.params.scrollbar;

        let newSize = dragSize;
        let newPos = (trackSize - dragSize) * progress;
        if (rtl) {
          newPos = -newPos;
          if (newPos > 0) {
            newSize = dragSize - newPos;
            newPos = 0;
          } else if (-newPos + dragSize > trackSize) {
            newSize = trackSize + newPos;
          }
        } else if (newPos < 0) {
          newSize = dragSize + newPos;
          newPos = 0;
        } else if (newPos + dragSize > trackSize) {
          newSize = trackSize - newPos;
        }
        if (swiper.isHorizontal()) {
          if (Support.transforms3d) {
            $dragEl.transform(`translate3d(${newPos}px, 0, 0)`);
          } else {
            $dragEl.transform(`translateX(${newPos}px)`);
          }
          $dragEl[0].style.width = `${newSize}px`;
        } else {
          if (Support.transforms3d) {
            $dragEl.transform(`translate3d(0px, ${newPos}px, 0)`);
          } else {
            $dragEl.transform(`translateY(${newPos}px)`);
          }
          $dragEl[0].style.height = `${newSize}px`;
        }
        if (params.hide) {
          clearTimeout(swiper.scrollbar.timeout);
          $el[0].style.opacity = 1;
          swiper.scrollbar.timeout = setTimeout(() => {
            $el[0].style.opacity = 0;
            $el.transition(400);
          }, 1000);
        }
      },
      setTransition(duration) {
        const swiper = this;
        if (!swiper.params.scrollbar.el || !swiper.scrollbar.el) return;
        swiper.scrollbar.$dragEl.transition(duration);
      },
      updateSize() {
        const swiper = this;
        if (!swiper.params.scrollbar.el || !swiper.scrollbar.el) return;

        const { scrollbar } = swiper;
        const { $dragEl, $el } = scrollbar;

        $dragEl[0].style.width = '';
        $dragEl[0].style.height = '';
        const trackSize = swiper.isHorizontal() ? $el[0].offsetWidth : $el[0].offsetHeight;

        const divider = swiper.size / swiper.virtualSize;
        const moveDivider = divider * (trackSize / swiper.size);
        let dragSize;
        if (swiper.params.scrollbar.dragSize === 'auto') {
          dragSize = trackSize * divider;
        } else {
          dragSize = parseInt(swiper.params.scrollbar.dragSize, 10);
        }

        if (swiper.isHorizontal()) {
          $dragEl[0].style.width = `${dragSize}px`;
        } else {
          $dragEl[0].style.height = `${dragSize}px`;
        }

        if (divider >= 1) {
          $el[0].style.display = 'none';
        } else {
          $el[0].style.display = '';
        }
        if (swiper.params.scrollbar.hide) {
          $el[0].style.opacity = 0;
        }
        Utils.extend(scrollbar, {
          trackSize,
          divider,
          moveDivider,
          dragSize,
        });
        scrollbar.$el[swiper.params.watchOverflow && swiper.isLocked ? 'addClass' : 'removeClass'](swiper.params.scrollbar.lockClass);
      },
      getPointerPosition(e) {
        const swiper = this;
        if (swiper.isHorizontal()) {
          return ((e.type === 'touchstart' || e.type === 'touchmove') ? e.targetTouches[0].pageX : e.pageX || e.clientX);
        }
        return ((e.type === 'touchstart' || e.type === 'touchmove') ? e.targetTouches[0].pageY : e.pageY || e.clientY);
      },
      setDragPosition(e) {
        const swiper = this;
        const { scrollbar, rtlTranslate: rtl } = swiper;
        const {
          $el,
          dragSize,
          trackSize,
          dragStartPos,
        } = scrollbar;

        let positionRatio;
        positionRatio = ((scrollbar.getPointerPosition(e)) - $el.offset()[swiper.isHorizontal() ? 'left' : 'top']
          - (dragStartPos !== null ? dragStartPos : dragSize / 2)) / (trackSize - dragSize);
        positionRatio = Math.max(Math.min(positionRatio, 1), 0);
        if (rtl) {
          positionRatio = 1 - positionRatio;
        }

        const position = swiper.minTranslate() + ((swiper.maxTranslate() - swiper.minTranslate()) * positionRatio);

        swiper.updateProgress(position);
        swiper.setTranslate(position);
        swiper.updateActiveIndex();
        swiper.updateSlidesClasses();
      },
      onDragStart(e) {
        const swiper = this;
        const params = swiper.params.scrollbar;
        const { scrollbar, $wrapperEl } = swiper;
        const { $el, $dragEl } = scrollbar;
        swiper.scrollbar.isTouched = true;
        swiper.scrollbar.dragStartPos = (e.target === $dragEl[0] || e.target === $dragEl)
          ? scrollbar.getPointerPosition(e) - e.target.getBoundingClientRect()[swiper.isHorizontal() ? 'left' : 'top'] : null;
        e.preventDefault();
        e.stopPropagation();

        $wrapperEl.transition(100);
        $dragEl.transition(100);
        scrollbar.setDragPosition(e);

        clearTimeout(swiper.scrollbar.dragTimeout);

        $el.transition(0);
        if (params.hide) {
          $el.css('opacity', 1);
        }
        swiper.emit('scrollbarDragStart', e);
      },
      onDragMove(e) {
        const swiper = this;
        const { scrollbar, $wrapperEl } = swiper;
        const { $el, $dragEl } = scrollbar;

        if (!swiper.scrollbar.isTouched) return;
        if (e.preventDefault) e.preventDefault();
        else e.returnValue = false;
        scrollbar.setDragPosition(e);
        $wrapperEl.transition(0);
        $el.transition(0);
        $dragEl.transition(0);
        swiper.emit('scrollbarDragMove', e);
      },
      onDragEnd(e) {
        const swiper = this;

        const params = swiper.params.scrollbar;
        const { scrollbar } = swiper;
        const { $el } = scrollbar;

        if (!swiper.scrollbar.isTouched) return;
        swiper.scrollbar.isTouched = false;
        if (params.hide) {
          clearTimeout(swiper.scrollbar.dragTimeout);
          swiper.scrollbar.dragTimeout = Utils.nextTick(() => {
            $el.css('opacity', 0);
            $el.transition(400);
          }, 1000);
        }
        swiper.emit('scrollbarDragEnd', e);
        if (params.snapOnRelease) {
          swiper.slideToClosest();
        }
      },
      enableDraggable() {
        const swiper = this;
        if (!swiper.params.scrollbar.el) return;
        const {
          scrollbar, touchEventsTouch, touchEventsDesktop, params,
        } = swiper;
        const $el = scrollbar.$el;
        const target = $el[0];
        const activeListener = Support.passiveListener && params.passiveListeners ? { passive: false, capture: false } : false;
        const passiveListener = Support.passiveListener && params.passiveListeners ? { passive: true, capture: false } : false;
        if (!Support.touch) {
          target.addEventListener(touchEventsDesktop.start, swiper.scrollbar.onDragStart, activeListener);
          doc.addEventListener(touchEventsDesktop.move, swiper.scrollbar.onDragMove, activeListener);
          doc.addEventListener(touchEventsDesktop.end, swiper.scrollbar.onDragEnd, passiveListener);
        } else {
          target.addEventListener(touchEventsTouch.start, swiper.scrollbar.onDragStart, activeListener);
          target.addEventListener(touchEventsTouch.move, swiper.scrollbar.onDragMove, activeListener);
          target.addEventListener(touchEventsTouch.end, swiper.scrollbar.onDragEnd, passiveListener);
        }
      },
      disableDraggable() {
        const swiper = this;
        if (!swiper.params.scrollbar.el) return;
        const {
          scrollbar, touchEventsTouch, touchEventsDesktop, params,
        } = swiper;
        const $el = scrollbar.$el;
        const target = $el[0];
        const activeListener = Support.passiveListener && params.passiveListeners ? { passive: false, capture: false } : false;
        const passiveListener = Support.passiveListener && params.passiveListeners ? { passive: true, capture: false } : false;
        if (!Support.touch) {
          target.removeEventListener(touchEventsDesktop.start, swiper.scrollbar.onDragStart, activeListener);
          doc.removeEventListener(touchEventsDesktop.move, swiper.scrollbar.onDragMove, activeListener);
          doc.removeEventListener(touchEventsDesktop.end, swiper.scrollbar.onDragEnd, passiveListener);
        } else {
          target.removeEventListener(touchEventsTouch.start, swiper.scrollbar.onDragStart, activeListener);
          target.removeEventListener(touchEventsTouch.move, swiper.scrollbar.onDragMove, activeListener);
          target.removeEventListener(touchEventsTouch.end, swiper.scrollbar.onDragEnd, passiveListener);
        }
      },
      init() {
        const swiper = this;
        if (!swiper.params.scrollbar.el) return;
        const { scrollbar, $el: $swiperEl } = swiper;
        const params = swiper.params.scrollbar;

        let $el = $(params.el);
        if (swiper.params.uniqueNavElements && typeof params.el === 'string' && $el.length > 1 && $swiperEl.find(params.el).length === 1) {
          $el = $swiperEl.find(params.el);
        }

        let $dragEl = $el.find(`.${swiper.params.scrollbar.dragClass}`);
        if ($dragEl.length === 0) {
          $dragEl = $(`<div class="${swiper.params.scrollbar.dragClass}"></div>`);
          $el.append($dragEl);
        }

        Utils.extend(scrollbar, {
          $el,
          el: $el[0],
          $dragEl,
          dragEl: $dragEl[0],
        });

        if (params.draggable) {
          scrollbar.enableDraggable();
        }
      },
      destroy() {
        const swiper = this;
        swiper.scrollbar.disableDraggable();
      },
    };

    var Scrollbar$1 = {
      name: 'scrollbar',
      params: {
        scrollbar: {
          el: null,
          dragSize: 'auto',
          hide: false,
          draggable: false,
          snapOnRelease: true,
          lockClass: 'swiper-scrollbar-lock',
          dragClass: 'swiper-scrollbar-drag',
        },
      },
      create() {
        const swiper = this;
        Utils.extend(swiper, {
          scrollbar: {
            init: Scrollbar.init.bind(swiper),
            destroy: Scrollbar.destroy.bind(swiper),
            updateSize: Scrollbar.updateSize.bind(swiper),
            setTranslate: Scrollbar.setTranslate.bind(swiper),
            setTransition: Scrollbar.setTransition.bind(swiper),
            enableDraggable: Scrollbar.enableDraggable.bind(swiper),
            disableDraggable: Scrollbar.disableDraggable.bind(swiper),
            setDragPosition: Scrollbar.setDragPosition.bind(swiper),
            getPointerPosition: Scrollbar.getPointerPosition.bind(swiper),
            onDragStart: Scrollbar.onDragStart.bind(swiper),
            onDragMove: Scrollbar.onDragMove.bind(swiper),
            onDragEnd: Scrollbar.onDragEnd.bind(swiper),
            isTouched: false,
            timeout: null,
            dragTimeout: null,
          },
        });
      },
      on: {
        init() {
          const swiper = this;
          swiper.scrollbar.init();
          swiper.scrollbar.updateSize();
          swiper.scrollbar.setTranslate();
        },
        update() {
          const swiper = this;
          swiper.scrollbar.updateSize();
        },
        resize() {
          const swiper = this;
          swiper.scrollbar.updateSize();
        },
        observerUpdate() {
          const swiper = this;
          swiper.scrollbar.updateSize();
        },
        setTranslate() {
          const swiper = this;
          swiper.scrollbar.setTranslate();
        },
        setTransition(duration) {
          const swiper = this;
          swiper.scrollbar.setTransition(duration);
        },
        destroy() {
          const swiper = this;
          swiper.scrollbar.destroy();
        },
      },
    };

    const Parallax = {
      setTransform(el, progress) {
        const swiper = this;
        const { rtl } = swiper;

        const $el = $(el);
        const rtlFactor = rtl ? -1 : 1;

        const p = $el.attr('data-swiper-parallax') || '0';
        let x = $el.attr('data-swiper-parallax-x');
        let y = $el.attr('data-swiper-parallax-y');
        const scale = $el.attr('data-swiper-parallax-scale');
        const opacity = $el.attr('data-swiper-parallax-opacity');

        if (x || y) {
          x = x || '0';
          y = y || '0';
        } else if (swiper.isHorizontal()) {
          x = p;
          y = '0';
        } else {
          y = p;
          x = '0';
        }

        if ((x).indexOf('%') >= 0) {
          x = `${parseInt(x, 10) * progress * rtlFactor}%`;
        } else {
          x = `${x * progress * rtlFactor}px`;
        }
        if ((y).indexOf('%') >= 0) {
          y = `${parseInt(y, 10) * progress}%`;
        } else {
          y = `${y * progress}px`;
        }

        if (typeof opacity !== 'undefined' && opacity !== null) {
          const currentOpacity = opacity - ((opacity - 1) * (1 - Math.abs(progress)));
          $el[0].style.opacity = currentOpacity;
        }
        if (typeof scale === 'undefined' || scale === null) {
          $el.transform(`translate3d(${x}, ${y}, 0px)`);
        } else {
          const currentScale = scale - ((scale - 1) * (1 - Math.abs(progress)));
          $el.transform(`translate3d(${x}, ${y}, 0px) scale(${currentScale})`);
        }
      },
      setTranslate() {
        const swiper = this;
        const {
          $el, slides, progress, snapGrid,
        } = swiper;
        $el.children('[data-swiper-parallax], [data-swiper-parallax-x], [data-swiper-parallax-y], [data-swiper-parallax-opacity], [data-swiper-parallax-scale]')
          .each((index, el) => {
            swiper.parallax.setTransform(el, progress);
          });
        slides.each((slideIndex, slideEl) => {
          let slideProgress = slideEl.progress;
          if (swiper.params.slidesPerGroup > 1 && swiper.params.slidesPerView !== 'auto') {
            slideProgress += Math.ceil(slideIndex / 2) - (progress * (snapGrid.length - 1));
          }
          slideProgress = Math.min(Math.max(slideProgress, -1), 1);
          $(slideEl).find('[data-swiper-parallax], [data-swiper-parallax-x], [data-swiper-parallax-y], [data-swiper-parallax-opacity], [data-swiper-parallax-scale]')
            .each((index, el) => {
              swiper.parallax.setTransform(el, slideProgress);
            });
        });
      },
      setTransition(duration = this.params.speed) {
        const swiper = this;
        const { $el } = swiper;
        $el.find('[data-swiper-parallax], [data-swiper-parallax-x], [data-swiper-parallax-y], [data-swiper-parallax-opacity], [data-swiper-parallax-scale]')
          .each((index, parallaxEl) => {
            const $parallaxEl = $(parallaxEl);
            let parallaxDuration = parseInt($parallaxEl.attr('data-swiper-parallax-duration'), 10) || duration;
            if (duration === 0) parallaxDuration = 0;
            $parallaxEl.transition(parallaxDuration);
          });
      },
    };

    var Parallax$1 = {
      name: 'parallax',
      params: {
        parallax: {
          enabled: false,
        },
      },
      create() {
        const swiper = this;
        Utils.extend(swiper, {
          parallax: {
            setTransform: Parallax.setTransform.bind(swiper),
            setTranslate: Parallax.setTranslate.bind(swiper),
            setTransition: Parallax.setTransition.bind(swiper),
          },
        });
      },
      on: {
        beforeInit() {
          const swiper = this;
          if (!swiper.params.parallax.enabled) return;
          swiper.params.watchSlidesProgress = true;
          swiper.originalParams.watchSlidesProgress = true;
        },
        init() {
          const swiper = this;
          if (!swiper.params.parallax.enabled) return;
          swiper.parallax.setTranslate();
        },
        setTranslate() {
          const swiper = this;
          if (!swiper.params.parallax.enabled) return;
          swiper.parallax.setTranslate();
        },
        setTransition(duration) {
          const swiper = this;
          if (!swiper.params.parallax.enabled) return;
          swiper.parallax.setTransition(duration);
        },
      },
    };

    const Zoom = {
      // Calc Scale From Multi-touches
      getDistanceBetweenTouches(e) {
        if (e.targetTouches.length < 2) return 1;
        const x1 = e.targetTouches[0].pageX;
        const y1 = e.targetTouches[0].pageY;
        const x2 = e.targetTouches[1].pageX;
        const y2 = e.targetTouches[1].pageY;
        const distance = Math.sqrt(((x2 - x1) ** 2) + ((y2 - y1) ** 2));
        return distance;
      },
      // Events
      onGestureStart(e) {
        const swiper = this;
        const params = swiper.params.zoom;
        const zoom = swiper.zoom;
        const { gesture } = zoom;
        zoom.fakeGestureTouched = false;
        zoom.fakeGestureMoved = false;
        if (!Support.gestures) {
          if (e.type !== 'touchstart' || (e.type === 'touchstart' && e.targetTouches.length < 2)) {
            return;
          }
          zoom.fakeGestureTouched = true;
          gesture.scaleStart = Zoom.getDistanceBetweenTouches(e);
        }
        if (!gesture.$slideEl || !gesture.$slideEl.length) {
          gesture.$slideEl = $(e.target).closest('.swiper-slide');
          if (gesture.$slideEl.length === 0) gesture.$slideEl = swiper.slides.eq(swiper.activeIndex);
          gesture.$imageEl = gesture.$slideEl.find('img, svg, canvas');
          gesture.$imageWrapEl = gesture.$imageEl.parent(`.${params.containerClass}`);
          gesture.maxRatio = gesture.$imageWrapEl.attr('data-swiper-zoom') || params.maxRatio;
          if (gesture.$imageWrapEl.length === 0) {
            gesture.$imageEl = undefined;
            return;
          }
        }
        gesture.$imageEl.transition(0);
        swiper.zoom.isScaling = true;
      },
      onGestureChange(e) {
        const swiper = this;
        const params = swiper.params.zoom;
        const zoom = swiper.zoom;
        const { gesture } = zoom;
        if (!Support.gestures) {
          if (e.type !== 'touchmove' || (e.type === 'touchmove' && e.targetTouches.length < 2)) {
            return;
          }
          zoom.fakeGestureMoved = true;
          gesture.scaleMove = Zoom.getDistanceBetweenTouches(e);
        }
        if (!gesture.$imageEl || gesture.$imageEl.length === 0) return;
        if (Support.gestures) {
          zoom.scale = e.scale * zoom.currentScale;
        } else {
          zoom.scale = (gesture.scaleMove / gesture.scaleStart) * zoom.currentScale;
        }
        if (zoom.scale > gesture.maxRatio) {
          zoom.scale = (gesture.maxRatio - 1) + (((zoom.scale - gesture.maxRatio) + 1) ** 0.5);
        }
        if (zoom.scale < params.minRatio) {
          zoom.scale = (params.minRatio + 1) - (((params.minRatio - zoom.scale) + 1) ** 0.5);
        }
        gesture.$imageEl.transform(`translate3d(0,0,0) scale(${zoom.scale})`);
      },
      onGestureEnd(e) {
        const swiper = this;
        const params = swiper.params.zoom;
        const zoom = swiper.zoom;
        const { gesture } = zoom;
        if (!Support.gestures) {
          if (!zoom.fakeGestureTouched || !zoom.fakeGestureMoved) {
            return;
          }
          if (e.type !== 'touchend' || (e.type === 'touchend' && e.changedTouches.length < 2 && !Device.android)) {
            return;
          }
          zoom.fakeGestureTouched = false;
          zoom.fakeGestureMoved = false;
        }
        if (!gesture.$imageEl || gesture.$imageEl.length === 0) return;
        zoom.scale = Math.max(Math.min(zoom.scale, gesture.maxRatio), params.minRatio);
        gesture.$imageEl.transition(swiper.params.speed).transform(`translate3d(0,0,0) scale(${zoom.scale})`);
        zoom.currentScale = zoom.scale;
        zoom.isScaling = false;
        if (zoom.scale === 1) gesture.$slideEl = undefined;
      },
      onTouchStart(e) {
        const swiper = this;
        const zoom = swiper.zoom;
        const { gesture, image } = zoom;
        if (!gesture.$imageEl || gesture.$imageEl.length === 0) return;
        if (image.isTouched) return;
        if (Device.android) e.preventDefault();
        image.isTouched = true;
        image.touchesStart.x = e.type === 'touchstart' ? e.targetTouches[0].pageX : e.pageX;
        image.touchesStart.y = e.type === 'touchstart' ? e.targetTouches[0].pageY : e.pageY;
      },
      onTouchMove(e) {
        const swiper = this;
        const zoom = swiper.zoom;
        const { gesture, image, velocity } = zoom;
        if (!gesture.$imageEl || gesture.$imageEl.length === 0) return;
        swiper.allowClick = false;
        if (!image.isTouched || !gesture.$slideEl) return;

        if (!image.isMoved) {
          image.width = gesture.$imageEl[0].offsetWidth;
          image.height = gesture.$imageEl[0].offsetHeight;
          image.startX = Utils.getTranslate(gesture.$imageWrapEl[0], 'x') || 0;
          image.startY = Utils.getTranslate(gesture.$imageWrapEl[0], 'y') || 0;
          gesture.slideWidth = gesture.$slideEl[0].offsetWidth;
          gesture.slideHeight = gesture.$slideEl[0].offsetHeight;
          gesture.$imageWrapEl.transition(0);
          if (swiper.rtl) {
            image.startX = -image.startX;
            image.startY = -image.startY;
          }
        }
        // Define if we need image drag
        const scaledWidth = image.width * zoom.scale;
        const scaledHeight = image.height * zoom.scale;

        if (scaledWidth < gesture.slideWidth && scaledHeight < gesture.slideHeight) return;

        image.minX = Math.min(((gesture.slideWidth / 2) - (scaledWidth / 2)), 0);
        image.maxX = -image.minX;
        image.minY = Math.min(((gesture.slideHeight / 2) - (scaledHeight / 2)), 0);
        image.maxY = -image.minY;

        image.touchesCurrent.x = e.type === 'touchmove' ? e.targetTouches[0].pageX : e.pageX;
        image.touchesCurrent.y = e.type === 'touchmove' ? e.targetTouches[0].pageY : e.pageY;

        if (!image.isMoved && !zoom.isScaling) {
          if (
            swiper.isHorizontal()
            && (
              (Math.floor(image.minX) === Math.floor(image.startX) && image.touchesCurrent.x < image.touchesStart.x)
              || (Math.floor(image.maxX) === Math.floor(image.startX) && image.touchesCurrent.x > image.touchesStart.x)
            )
          ) {
            image.isTouched = false;
            return;
          } if (
            !swiper.isHorizontal()
            && (
              (Math.floor(image.minY) === Math.floor(image.startY) && image.touchesCurrent.y < image.touchesStart.y)
              || (Math.floor(image.maxY) === Math.floor(image.startY) && image.touchesCurrent.y > image.touchesStart.y)
            )
          ) {
            image.isTouched = false;
            return;
          }
        }
        e.preventDefault();
        e.stopPropagation();

        image.isMoved = true;
        image.currentX = (image.touchesCurrent.x - image.touchesStart.x) + image.startX;
        image.currentY = (image.touchesCurrent.y - image.touchesStart.y) + image.startY;

        if (image.currentX < image.minX) {
          image.currentX = (image.minX + 1) - (((image.minX - image.currentX) + 1) ** 0.8);
        }
        if (image.currentX > image.maxX) {
          image.currentX = (image.maxX - 1) + (((image.currentX - image.maxX) + 1) ** 0.8);
        }

        if (image.currentY < image.minY) {
          image.currentY = (image.minY + 1) - (((image.minY - image.currentY) + 1) ** 0.8);
        }
        if (image.currentY > image.maxY) {
          image.currentY = (image.maxY - 1) + (((image.currentY - image.maxY) + 1) ** 0.8);
        }

        // Velocity
        if (!velocity.prevPositionX) velocity.prevPositionX = image.touchesCurrent.x;
        if (!velocity.prevPositionY) velocity.prevPositionY = image.touchesCurrent.y;
        if (!velocity.prevTime) velocity.prevTime = Date.now();
        velocity.x = (image.touchesCurrent.x - velocity.prevPositionX) / (Date.now() - velocity.prevTime) / 2;
        velocity.y = (image.touchesCurrent.y - velocity.prevPositionY) / (Date.now() - velocity.prevTime) / 2;
        if (Math.abs(image.touchesCurrent.x - velocity.prevPositionX) < 2) velocity.x = 0;
        if (Math.abs(image.touchesCurrent.y - velocity.prevPositionY) < 2) velocity.y = 0;
        velocity.prevPositionX = image.touchesCurrent.x;
        velocity.prevPositionY = image.touchesCurrent.y;
        velocity.prevTime = Date.now();

        gesture.$imageWrapEl.transform(`translate3d(${image.currentX}px, ${image.currentY}px,0)`);
      },
      onTouchEnd() {
        const swiper = this;
        const zoom = swiper.zoom;
        const { gesture, image, velocity } = zoom;
        if (!gesture.$imageEl || gesture.$imageEl.length === 0) return;
        if (!image.isTouched || !image.isMoved) {
          image.isTouched = false;
          image.isMoved = false;
          return;
        }
        image.isTouched = false;
        image.isMoved = false;
        let momentumDurationX = 300;
        let momentumDurationY = 300;
        const momentumDistanceX = velocity.x * momentumDurationX;
        const newPositionX = image.currentX + momentumDistanceX;
        const momentumDistanceY = velocity.y * momentumDurationY;
        const newPositionY = image.currentY + momentumDistanceY;

        // Fix duration
        if (velocity.x !== 0) momentumDurationX = Math.abs((newPositionX - image.currentX) / velocity.x);
        if (velocity.y !== 0) momentumDurationY = Math.abs((newPositionY - image.currentY) / velocity.y);
        const momentumDuration = Math.max(momentumDurationX, momentumDurationY);

        image.currentX = newPositionX;
        image.currentY = newPositionY;

        // Define if we need image drag
        const scaledWidth = image.width * zoom.scale;
        const scaledHeight = image.height * zoom.scale;
        image.minX = Math.min(((gesture.slideWidth / 2) - (scaledWidth / 2)), 0);
        image.maxX = -image.minX;
        image.minY = Math.min(((gesture.slideHeight / 2) - (scaledHeight / 2)), 0);
        image.maxY = -image.minY;
        image.currentX = Math.max(Math.min(image.currentX, image.maxX), image.minX);
        image.currentY = Math.max(Math.min(image.currentY, image.maxY), image.minY);

        gesture.$imageWrapEl.transition(momentumDuration).transform(`translate3d(${image.currentX}px, ${image.currentY}px,0)`);
      },
      onTransitionEnd() {
        const swiper = this;
        const zoom = swiper.zoom;
        const { gesture } = zoom;
        if (gesture.$slideEl && swiper.previousIndex !== swiper.activeIndex) {
          gesture.$imageEl.transform('translate3d(0,0,0) scale(1)');
          gesture.$imageWrapEl.transform('translate3d(0,0,0)');

          zoom.scale = 1;
          zoom.currentScale = 1;

          gesture.$slideEl = undefined;
          gesture.$imageEl = undefined;
          gesture.$imageWrapEl = undefined;
        }
      },
      // Toggle Zoom
      toggle(e) {
        const swiper = this;
        const zoom = swiper.zoom;

        if (zoom.scale && zoom.scale !== 1) {
          // Zoom Out
          zoom.out();
        } else {
          // Zoom In
          zoom.in(e);
        }
      },
      in(e) {
        const swiper = this;

        const zoom = swiper.zoom;
        const params = swiper.params.zoom;
        const { gesture, image } = zoom;

        if (!gesture.$slideEl) {
          gesture.$slideEl = swiper.clickedSlide ? $(swiper.clickedSlide) : swiper.slides.eq(swiper.activeIndex);
          gesture.$imageEl = gesture.$slideEl.find('img, svg, canvas');
          gesture.$imageWrapEl = gesture.$imageEl.parent(`.${params.containerClass}`);
        }
        if (!gesture.$imageEl || gesture.$imageEl.length === 0) return;

        gesture.$slideEl.addClass(`${params.zoomedSlideClass}`);

        let touchX;
        let touchY;
        let offsetX;
        let offsetY;
        let diffX;
        let diffY;
        let translateX;
        let translateY;
        let imageWidth;
        let imageHeight;
        let scaledWidth;
        let scaledHeight;
        let translateMinX;
        let translateMinY;
        let translateMaxX;
        let translateMaxY;
        let slideWidth;
        let slideHeight;

        if (typeof image.touchesStart.x === 'undefined' && e) {
          touchX = e.type === 'touchend' ? e.changedTouches[0].pageX : e.pageX;
          touchY = e.type === 'touchend' ? e.changedTouches[0].pageY : e.pageY;
        } else {
          touchX = image.touchesStart.x;
          touchY = image.touchesStart.y;
        }

        zoom.scale = gesture.$imageWrapEl.attr('data-swiper-zoom') || params.maxRatio;
        zoom.currentScale = gesture.$imageWrapEl.attr('data-swiper-zoom') || params.maxRatio;
        if (e) {
          slideWidth = gesture.$slideEl[0].offsetWidth;
          slideHeight = gesture.$slideEl[0].offsetHeight;
          offsetX = gesture.$slideEl.offset().left;
          offsetY = gesture.$slideEl.offset().top;
          diffX = (offsetX + (slideWidth / 2)) - touchX;
          diffY = (offsetY + (slideHeight / 2)) - touchY;

          imageWidth = gesture.$imageEl[0].offsetWidth;
          imageHeight = gesture.$imageEl[0].offsetHeight;
          scaledWidth = imageWidth * zoom.scale;
          scaledHeight = imageHeight * zoom.scale;

          translateMinX = Math.min(((slideWidth / 2) - (scaledWidth / 2)), 0);
          translateMinY = Math.min(((slideHeight / 2) - (scaledHeight / 2)), 0);
          translateMaxX = -translateMinX;
          translateMaxY = -translateMinY;

          translateX = diffX * zoom.scale;
          translateY = diffY * zoom.scale;

          if (translateX < translateMinX) {
            translateX = translateMinX;
          }
          if (translateX > translateMaxX) {
            translateX = translateMaxX;
          }

          if (translateY < translateMinY) {
            translateY = translateMinY;
          }
          if (translateY > translateMaxY) {
            translateY = translateMaxY;
          }
        } else {
          translateX = 0;
          translateY = 0;
        }
        gesture.$imageWrapEl.transition(300).transform(`translate3d(${translateX}px, ${translateY}px,0)`);
        gesture.$imageEl.transition(300).transform(`translate3d(0,0,0) scale(${zoom.scale})`);
      },
      out() {
        const swiper = this;

        const zoom = swiper.zoom;
        const params = swiper.params.zoom;
        const { gesture } = zoom;

        if (!gesture.$slideEl) {
          gesture.$slideEl = swiper.clickedSlide ? $(swiper.clickedSlide) : swiper.slides.eq(swiper.activeIndex);
          gesture.$imageEl = gesture.$slideEl.find('img, svg, canvas');
          gesture.$imageWrapEl = gesture.$imageEl.parent(`.${params.containerClass}`);
        }
        if (!gesture.$imageEl || gesture.$imageEl.length === 0) return;

        zoom.scale = 1;
        zoom.currentScale = 1;
        gesture.$imageWrapEl.transition(300).transform('translate3d(0,0,0)');
        gesture.$imageEl.transition(300).transform('translate3d(0,0,0) scale(1)');
        gesture.$slideEl.removeClass(`${params.zoomedSlideClass}`);
        gesture.$slideEl = undefined;
      },
      // Attach/Detach Events
      enable() {
        const swiper = this;
        const zoom = swiper.zoom;
        if (zoom.enabled) return;
        zoom.enabled = true;

        const passiveListener = swiper.touchEvents.start === 'touchstart' && Support.passiveListener && swiper.params.passiveListeners ? { passive: true, capture: false } : false;

        // Scale image
        if (Support.gestures) {
          swiper.$wrapperEl.on('gesturestart', '.swiper-slide', zoom.onGestureStart, passiveListener);
          swiper.$wrapperEl.on('gesturechange', '.swiper-slide', zoom.onGestureChange, passiveListener);
          swiper.$wrapperEl.on('gestureend', '.swiper-slide', zoom.onGestureEnd, passiveListener);
        } else if (swiper.touchEvents.start === 'touchstart') {
          swiper.$wrapperEl.on(swiper.touchEvents.start, '.swiper-slide', zoom.onGestureStart, passiveListener);
          swiper.$wrapperEl.on(swiper.touchEvents.move, '.swiper-slide', zoom.onGestureChange, passiveListener);
          swiper.$wrapperEl.on(swiper.touchEvents.end, '.swiper-slide', zoom.onGestureEnd, passiveListener);
        }

        // Move image
        swiper.$wrapperEl.on(swiper.touchEvents.move, `.${swiper.params.zoom.containerClass}`, zoom.onTouchMove);
      },
      disable() {
        const swiper = this;
        const zoom = swiper.zoom;
        if (!zoom.enabled) return;

        swiper.zoom.enabled = false;

        const passiveListener = swiper.touchEvents.start === 'touchstart' && Support.passiveListener && swiper.params.passiveListeners ? { passive: true, capture: false } : false;

        // Scale image
        if (Support.gestures) {
          swiper.$wrapperEl.off('gesturestart', '.swiper-slide', zoom.onGestureStart, passiveListener);
          swiper.$wrapperEl.off('gesturechange', '.swiper-slide', zoom.onGestureChange, passiveListener);
          swiper.$wrapperEl.off('gestureend', '.swiper-slide', zoom.onGestureEnd, passiveListener);
        } else if (swiper.touchEvents.start === 'touchstart') {
          swiper.$wrapperEl.off(swiper.touchEvents.start, '.swiper-slide', zoom.onGestureStart, passiveListener);
          swiper.$wrapperEl.off(swiper.touchEvents.move, '.swiper-slide', zoom.onGestureChange, passiveListener);
          swiper.$wrapperEl.off(swiper.touchEvents.end, '.swiper-slide', zoom.onGestureEnd, passiveListener);
        }

        // Move image
        swiper.$wrapperEl.off(swiper.touchEvents.move, `.${swiper.params.zoom.containerClass}`, zoom.onTouchMove);
      },
    };

    var Zoom$1 = {
      name: 'zoom',
      params: {
        zoom: {
          enabled: false,
          maxRatio: 3,
          minRatio: 1,
          toggle: true,
          containerClass: 'swiper-zoom-container',
          zoomedSlideClass: 'swiper-slide-zoomed',
        },
      },
      create() {
        const swiper = this;
        const zoom = {
          enabled: false,
          scale: 1,
          currentScale: 1,
          isScaling: false,
          gesture: {
            $slideEl: undefined,
            slideWidth: undefined,
            slideHeight: undefined,
            $imageEl: undefined,
            $imageWrapEl: undefined,
            maxRatio: 3,
          },
          image: {
            isTouched: undefined,
            isMoved: undefined,
            currentX: undefined,
            currentY: undefined,
            minX: undefined,
            minY: undefined,
            maxX: undefined,
            maxY: undefined,
            width: undefined,
            height: undefined,
            startX: undefined,
            startY: undefined,
            touchesStart: {},
            touchesCurrent: {},
          },
          velocity: {
            x: undefined,
            y: undefined,
            prevPositionX: undefined,
            prevPositionY: undefined,
            prevTime: undefined,
          },
        };

        ('onGestureStart onGestureChange onGestureEnd onTouchStart onTouchMove onTouchEnd onTransitionEnd toggle enable disable in out').split(' ').forEach((methodName) => {
          zoom[methodName] = Zoom[methodName].bind(swiper);
        });
        Utils.extend(swiper, {
          zoom,
        });

        let scale = 1;
        Object.defineProperty(swiper.zoom, 'scale', {
          get() {
            return scale;
          },
          set(value) {
            if (scale !== value) {
              const imageEl = swiper.zoom.gesture.$imageEl ? swiper.zoom.gesture.$imageEl[0] : undefined;
              const slideEl = swiper.zoom.gesture.$slideEl ? swiper.zoom.gesture.$slideEl[0] : undefined;
              swiper.emit('zoomChange', value, imageEl, slideEl);
            }
            scale = value;
          },
        });
      },
      on: {
        init() {
          const swiper = this;
          if (swiper.params.zoom.enabled) {
            swiper.zoom.enable();
          }
        },
        destroy() {
          const swiper = this;
          swiper.zoom.disable();
        },
        touchStart(e) {
          const swiper = this;
          if (!swiper.zoom.enabled) return;
          swiper.zoom.onTouchStart(e);
        },
        touchEnd(e) {
          const swiper = this;
          if (!swiper.zoom.enabled) return;
          swiper.zoom.onTouchEnd(e);
        },
        doubleTap(e) {
          const swiper = this;
          if (swiper.params.zoom.enabled && swiper.zoom.enabled && swiper.params.zoom.toggle) {
            swiper.zoom.toggle(e);
          }
        },
        transitionEnd() {
          const swiper = this;
          if (swiper.zoom.enabled && swiper.params.zoom.enabled) {
            swiper.zoom.onTransitionEnd();
          }
        },
      },
    };

    const Lazy = {
      loadInSlide(index, loadInDuplicate = true) {
        const swiper = this;
        const params = swiper.params.lazy;
        if (typeof index === 'undefined') return;
        if (swiper.slides.length === 0) return;
        const isVirtual = swiper.virtual && swiper.params.virtual.enabled;

        const $slideEl = isVirtual
          ? swiper.$wrapperEl.children(`.${swiper.params.slideClass}[data-swiper-slide-index="${index}"]`)
          : swiper.slides.eq(index);

        let $images = $slideEl.find(`.${params.elementClass}:not(.${params.loadedClass}):not(.${params.loadingClass})`);
        if ($slideEl.hasClass(params.elementClass) && !$slideEl.hasClass(params.loadedClass) && !$slideEl.hasClass(params.loadingClass)) {
          $images = $images.add($slideEl[0]);
        }
        if ($images.length === 0) return;

        $images.each((imageIndex, imageEl) => {
          const $imageEl = $(imageEl);
          $imageEl.addClass(params.loadingClass);

          const background = $imageEl.attr('data-background');
          const src = $imageEl.attr('data-src');
          const srcset = $imageEl.attr('data-srcset');
          const sizes = $imageEl.attr('data-sizes');

          swiper.loadImage($imageEl[0], (src || background), srcset, sizes, false, () => {
            if (typeof swiper === 'undefined' || swiper === null || !swiper || (swiper && !swiper.params) || swiper.destroyed) return;
            if (background) {
              $imageEl.css('background-image', `url("${background}")`);
              $imageEl.removeAttr('data-background');
            } else {
              if (srcset) {
                $imageEl.attr('srcset', srcset);
                $imageEl.removeAttr('data-srcset');
              }
              if (sizes) {
                $imageEl.attr('sizes', sizes);
                $imageEl.removeAttr('data-sizes');
              }
              if (src) {
                $imageEl.attr('src', src);
                $imageEl.removeAttr('data-src');
              }
            }

            $imageEl.addClass(params.loadedClass).removeClass(params.loadingClass);
            $slideEl.find(`.${params.preloaderClass}`).remove();
            if (swiper.params.loop && loadInDuplicate) {
              const slideOriginalIndex = $slideEl.attr('data-swiper-slide-index');
              if ($slideEl.hasClass(swiper.params.slideDuplicateClass)) {
                const originalSlide = swiper.$wrapperEl.children(`[data-swiper-slide-index="${slideOriginalIndex}"]:not(.${swiper.params.slideDuplicateClass})`);
                swiper.lazy.loadInSlide(originalSlide.index(), false);
              } else {
                const duplicatedSlide = swiper.$wrapperEl.children(`.${swiper.params.slideDuplicateClass}[data-swiper-slide-index="${slideOriginalIndex}"]`);
                swiper.lazy.loadInSlide(duplicatedSlide.index(), false);
              }
            }
            swiper.emit('lazyImageReady', $slideEl[0], $imageEl[0]);
          });

          swiper.emit('lazyImageLoad', $slideEl[0], $imageEl[0]);
        });
      },
      load() {
        const swiper = this;
        const {
          $wrapperEl, params: swiperParams, slides, activeIndex,
        } = swiper;
        const isVirtual = swiper.virtual && swiperParams.virtual.enabled;
        const params = swiperParams.lazy;

        let slidesPerView = swiperParams.slidesPerView;
        if (slidesPerView === 'auto') {
          slidesPerView = 0;
        }

        function slideExist(index) {
          if (isVirtual) {
            if ($wrapperEl.children(`.${swiperParams.slideClass}[data-swiper-slide-index="${index}"]`).length) {
              return true;
            }
          } else if (slides[index]) return true;
          return false;
        }
        function slideIndex(slideEl) {
          if (isVirtual) {
            return $(slideEl).attr('data-swiper-slide-index');
          }
          return $(slideEl).index();
        }

        if (!swiper.lazy.initialImageLoaded) swiper.lazy.initialImageLoaded = true;
        if (swiper.params.watchSlidesVisibility) {
          $wrapperEl.children(`.${swiperParams.slideVisibleClass}`).each((elIndex, slideEl) => {
            const index = isVirtual ? $(slideEl).attr('data-swiper-slide-index') : $(slideEl).index();
            swiper.lazy.loadInSlide(index);
          });
        } else if (slidesPerView > 1) {
          for (let i = activeIndex; i < activeIndex + slidesPerView; i += 1) {
            if (slideExist(i)) swiper.lazy.loadInSlide(i);
          }
        } else {
          swiper.lazy.loadInSlide(activeIndex);
        }
        if (params.loadPrevNext) {
          if (slidesPerView > 1 || (params.loadPrevNextAmount && params.loadPrevNextAmount > 1)) {
            const amount = params.loadPrevNextAmount;
            const spv = slidesPerView;
            const maxIndex = Math.min(activeIndex + spv + Math.max(amount, spv), slides.length);
            const minIndex = Math.max(activeIndex - Math.max(spv, amount), 0);
            // Next Slides
            for (let i = activeIndex + slidesPerView; i < maxIndex; i += 1) {
              if (slideExist(i)) swiper.lazy.loadInSlide(i);
            }
            // Prev Slides
            for (let i = minIndex; i < activeIndex; i += 1) {
              if (slideExist(i)) swiper.lazy.loadInSlide(i);
            }
          } else {
            const nextSlide = $wrapperEl.children(`.${swiperParams.slideNextClass}`);
            if (nextSlide.length > 0) swiper.lazy.loadInSlide(slideIndex(nextSlide));

            const prevSlide = $wrapperEl.children(`.${swiperParams.slidePrevClass}`);
            if (prevSlide.length > 0) swiper.lazy.loadInSlide(slideIndex(prevSlide));
          }
        }
      },
    };

    var Lazy$1 = {
      name: 'lazy',
      params: {
        lazy: {
          enabled: false,
          loadPrevNext: false,
          loadPrevNextAmount: 1,
          loadOnTransitionStart: false,

          elementClass: 'swiper-lazy',
          loadingClass: 'swiper-lazy-loading',
          loadedClass: 'swiper-lazy-loaded',
          preloaderClass: 'swiper-lazy-preloader',
        },
      },
      create() {
        const swiper = this;
        Utils.extend(swiper, {
          lazy: {
            initialImageLoaded: false,
            load: Lazy.load.bind(swiper),
            loadInSlide: Lazy.loadInSlide.bind(swiper),
          },
        });
      },
      on: {
        beforeInit() {
          const swiper = this;
          if (swiper.params.lazy.enabled && swiper.params.preloadImages) {
            swiper.params.preloadImages = false;
          }
        },
        init() {
          const swiper = this;
          if (swiper.params.lazy.enabled && !swiper.params.loop && swiper.params.initialSlide === 0) {
            swiper.lazy.load();
          }
        },
        scroll() {
          const swiper = this;
          if (swiper.params.freeMode && !swiper.params.freeModeSticky) {
            swiper.lazy.load();
          }
        },
        resize() {
          const swiper = this;
          if (swiper.params.lazy.enabled) {
            swiper.lazy.load();
          }
        },
        scrollbarDragMove() {
          const swiper = this;
          if (swiper.params.lazy.enabled) {
            swiper.lazy.load();
          }
        },
        transitionStart() {
          const swiper = this;
          if (swiper.params.lazy.enabled) {
            if (swiper.params.lazy.loadOnTransitionStart || (!swiper.params.lazy.loadOnTransitionStart && !swiper.lazy.initialImageLoaded)) {
              swiper.lazy.load();
            }
          }
        },
        transitionEnd() {
          const swiper = this;
          if (swiper.params.lazy.enabled && !swiper.params.lazy.loadOnTransitionStart) {
            swiper.lazy.load();
          }
        },
      },
    };

    /* eslint no-bitwise: ["error", { "allow": [">>"] }] */

    const Controller = {
      LinearSpline: function LinearSpline(x, y) {
        const binarySearch = (function search() {
          let maxIndex;
          let minIndex;
          let guess;
          return (array, val) => {
            minIndex = -1;
            maxIndex = array.length;
            while (maxIndex - minIndex > 1) {
              guess = maxIndex + minIndex >> 1;
              if (array[guess] <= val) {
                minIndex = guess;
              } else {
                maxIndex = guess;
              }
            }
            return maxIndex;
          };
        }());
        this.x = x;
        this.y = y;
        this.lastIndex = x.length - 1;
        // Given an x value (x2), return the expected y2 value:
        // (x1,y1) is the known point before given value,
        // (x3,y3) is the known point after given value.
        let i1;
        let i3;

        this.interpolate = function interpolate(x2) {
          if (!x2) return 0;

          // Get the indexes of x1 and x3 (the array indexes before and after given x2):
          i3 = binarySearch(this.x, x2);
          i1 = i3 - 1;

          // We have our indexes i1 & i3, so we can calculate already:
          // y2 := ((x2−x1) × (y3−y1)) ÷ (x3−x1) + y1
          return (((x2 - this.x[i1]) * (this.y[i3] - this.y[i1])) / (this.x[i3] - this.x[i1])) + this.y[i1];
        };
        return this;
      },
      // xxx: for now i will just save one spline function to to
      getInterpolateFunction(c) {
        const swiper = this;
        if (!swiper.controller.spline) {
          swiper.controller.spline = swiper.params.loop
            ? new Controller.LinearSpline(swiper.slidesGrid, c.slidesGrid)
            : new Controller.LinearSpline(swiper.snapGrid, c.snapGrid);
        }
      },
      setTranslate(setTranslate, byController) {
        const swiper = this;
        const controlled = swiper.controller.control;
        let multiplier;
        let controlledTranslate;
        function setControlledTranslate(c) {
          // this will create an Interpolate function based on the snapGrids
          // x is the Grid of the scrolled scroller and y will be the controlled scroller
          // it makes sense to create this only once and recall it for the interpolation
          // the function does a lot of value caching for performance
          const translate = swiper.rtlTranslate ? -swiper.translate : swiper.translate;
          if (swiper.params.controller.by === 'slide') {
            swiper.controller.getInterpolateFunction(c);
            // i am not sure why the values have to be multiplicated this way, tried to invert the snapGrid
            // but it did not work out
            controlledTranslate = -swiper.controller.spline.interpolate(-translate);
          }

          if (!controlledTranslate || swiper.params.controller.by === 'container') {
            multiplier = (c.maxTranslate() - c.minTranslate()) / (swiper.maxTranslate() - swiper.minTranslate());
            controlledTranslate = ((translate - swiper.minTranslate()) * multiplier) + c.minTranslate();
          }

          if (swiper.params.controller.inverse) {
            controlledTranslate = c.maxTranslate() - controlledTranslate;
          }
          c.updateProgress(controlledTranslate);
          c.setTranslate(controlledTranslate, swiper);
          c.updateActiveIndex();
          c.updateSlidesClasses();
        }
        if (Array.isArray(controlled)) {
          for (let i = 0; i < controlled.length; i += 1) {
            if (controlled[i] !== byController && controlled[i] instanceof Swiper) {
              setControlledTranslate(controlled[i]);
            }
          }
        } else if (controlled instanceof Swiper && byController !== controlled) {
          setControlledTranslate(controlled);
        }
      },
      setTransition(duration, byController) {
        const swiper = this;
        const controlled = swiper.controller.control;
        let i;
        function setControlledTransition(c) {
          c.setTransition(duration, swiper);
          if (duration !== 0) {
            c.transitionStart();
            if (c.params.autoHeight) {
              Utils.nextTick(() => {
                c.updateAutoHeight();
              });
            }
            c.$wrapperEl.transitionEnd(() => {
              if (!controlled) return;
              if (c.params.loop && swiper.params.controller.by === 'slide') {
                c.loopFix();
              }
              c.transitionEnd();
            });
          }
        }
        if (Array.isArray(controlled)) {
          for (i = 0; i < controlled.length; i += 1) {
            if (controlled[i] !== byController && controlled[i] instanceof Swiper) {
              setControlledTransition(controlled[i]);
            }
          }
        } else if (controlled instanceof Swiper && byController !== controlled) {
          setControlledTransition(controlled);
        }
      },
    };
    var Controller$1 = {
      name: 'controller',
      params: {
        controller: {
          control: undefined,
          inverse: false,
          by: 'slide', // or 'container'
        },
      },
      create() {
        const swiper = this;
        Utils.extend(swiper, {
          controller: {
            control: swiper.params.controller.control,
            getInterpolateFunction: Controller.getInterpolateFunction.bind(swiper),
            setTranslate: Controller.setTranslate.bind(swiper),
            setTransition: Controller.setTransition.bind(swiper),
          },
        });
      },
      on: {
        update() {
          const swiper = this;
          if (!swiper.controller.control) return;
          if (swiper.controller.spline) {
            swiper.controller.spline = undefined;
            delete swiper.controller.spline;
          }
        },
        resize() {
          const swiper = this;
          if (!swiper.controller.control) return;
          if (swiper.controller.spline) {
            swiper.controller.spline = undefined;
            delete swiper.controller.spline;
          }
        },
        observerUpdate() {
          const swiper = this;
          if (!swiper.controller.control) return;
          if (swiper.controller.spline) {
            swiper.controller.spline = undefined;
            delete swiper.controller.spline;
          }
        },
        setTranslate(translate, byController) {
          const swiper = this;
          if (!swiper.controller.control) return;
          swiper.controller.setTranslate(translate, byController);
        },
        setTransition(duration, byController) {
          const swiper = this;
          if (!swiper.controller.control) return;
          swiper.controller.setTransition(duration, byController);
        },
      },
    };

    const a11y = {
      makeElFocusable($el) {
        $el.attr('tabIndex', '0');
        return $el;
      },
      addElRole($el, role) {
        $el.attr('role', role);
        return $el;
      },
      addElLabel($el, label) {
        $el.attr('aria-label', label);
        return $el;
      },
      disableEl($el) {
        $el.attr('aria-disabled', true);
        return $el;
      },
      enableEl($el) {
        $el.attr('aria-disabled', false);
        return $el;
      },
      onEnterKey(e) {
        const swiper = this;
        const params = swiper.params.a11y;
        if (e.keyCode !== 13) return;
        const $targetEl = $(e.target);
        if (swiper.navigation && swiper.navigation.$nextEl && $targetEl.is(swiper.navigation.$nextEl)) {
          if (!(swiper.isEnd && !swiper.params.loop)) {
            swiper.slideNext();
          }
          if (swiper.isEnd) {
            swiper.a11y.notify(params.lastSlideMessage);
          } else {
            swiper.a11y.notify(params.nextSlideMessage);
          }
        }
        if (swiper.navigation && swiper.navigation.$prevEl && $targetEl.is(swiper.navigation.$prevEl)) {
          if (!(swiper.isBeginning && !swiper.params.loop)) {
            swiper.slidePrev();
          }
          if (swiper.isBeginning) {
            swiper.a11y.notify(params.firstSlideMessage);
          } else {
            swiper.a11y.notify(params.prevSlideMessage);
          }
        }
        if (swiper.pagination && $targetEl.is(`.${swiper.params.pagination.bulletClass}`)) {
          $targetEl[0].click();
        }
      },
      notify(message) {
        const swiper = this;
        const notification = swiper.a11y.liveRegion;
        if (notification.length === 0) return;
        notification.html('');
        notification.html(message);
      },
      updateNavigation() {
        const swiper = this;

        if (swiper.params.loop) return;
        const { $nextEl, $prevEl } = swiper.navigation;

        if ($prevEl && $prevEl.length > 0) {
          if (swiper.isBeginning) {
            swiper.a11y.disableEl($prevEl);
          } else {
            swiper.a11y.enableEl($prevEl);
          }
        }
        if ($nextEl && $nextEl.length > 0) {
          if (swiper.isEnd) {
            swiper.a11y.disableEl($nextEl);
          } else {
            swiper.a11y.enableEl($nextEl);
          }
        }
      },
      updatePagination() {
        const swiper = this;
        const params = swiper.params.a11y;
        if (swiper.pagination && swiper.params.pagination.clickable && swiper.pagination.bullets && swiper.pagination.bullets.length) {
          swiper.pagination.bullets.each((bulletIndex, bulletEl) => {
            const $bulletEl = $(bulletEl);
            swiper.a11y.makeElFocusable($bulletEl);
            swiper.a11y.addElRole($bulletEl, 'button');
            swiper.a11y.addElLabel($bulletEl, params.paginationBulletMessage.replace(/{{index}}/, $bulletEl.index() + 1));
          });
        }
      },
      init() {
        const swiper = this;

        swiper.$el.append(swiper.a11y.liveRegion);

        // Navigation
        const params = swiper.params.a11y;
        let $nextEl;
        let $prevEl;
        if (swiper.navigation && swiper.navigation.$nextEl) {
          $nextEl = swiper.navigation.$nextEl;
        }
        if (swiper.navigation && swiper.navigation.$prevEl) {
          $prevEl = swiper.navigation.$prevEl;
        }
        if ($nextEl) {
          swiper.a11y.makeElFocusable($nextEl);
          swiper.a11y.addElRole($nextEl, 'button');
          swiper.a11y.addElLabel($nextEl, params.nextSlideMessage);
          $nextEl.on('keydown', swiper.a11y.onEnterKey);
        }
        if ($prevEl) {
          swiper.a11y.makeElFocusable($prevEl);
          swiper.a11y.addElRole($prevEl, 'button');
          swiper.a11y.addElLabel($prevEl, params.prevSlideMessage);
          $prevEl.on('keydown', swiper.a11y.onEnterKey);
        }

        // Pagination
        if (swiper.pagination && swiper.params.pagination.clickable && swiper.pagination.bullets && swiper.pagination.bullets.length) {
          swiper.pagination.$el.on('keydown', `.${swiper.params.pagination.bulletClass}`, swiper.a11y.onEnterKey);
        }
      },
      destroy() {
        const swiper = this;
        if (swiper.a11y.liveRegion && swiper.a11y.liveRegion.length > 0) swiper.a11y.liveRegion.remove();

        let $nextEl;
        let $prevEl;
        if (swiper.navigation && swiper.navigation.$nextEl) {
          $nextEl = swiper.navigation.$nextEl;
        }
        if (swiper.navigation && swiper.navigation.$prevEl) {
          $prevEl = swiper.navigation.$prevEl;
        }
        if ($nextEl) {
          $nextEl.off('keydown', swiper.a11y.onEnterKey);
        }
        if ($prevEl) {
          $prevEl.off('keydown', swiper.a11y.onEnterKey);
        }

        // Pagination
        if (swiper.pagination && swiper.params.pagination.clickable && swiper.pagination.bullets && swiper.pagination.bullets.length) {
          swiper.pagination.$el.off('keydown', `.${swiper.params.pagination.bulletClass}`, swiper.a11y.onEnterKey);
        }
      },
    };
    var A11y = {
      name: 'a11y',
      params: {
        a11y: {
          enabled: true,
          notificationClass: 'swiper-notification',
          prevSlideMessage: 'Previous slide',
          nextSlideMessage: 'Next slide',
          firstSlideMessage: 'This is the first slide',
          lastSlideMessage: 'This is the last slide',
          paginationBulletMessage: 'Go to slide {{index}}',
        },
      },
      create() {
        const swiper = this;
        Utils.extend(swiper, {
          a11y: {
            liveRegion: $(`<span class="${swiper.params.a11y.notificationClass}" aria-live="assertive" aria-atomic="true"></span>`),
          },
        });
        Object.keys(a11y).forEach((methodName) => {
          swiper.a11y[methodName] = a11y[methodName].bind(swiper);
        });
      },
      on: {
        init() {
          const swiper = this;
          if (!swiper.params.a11y.enabled) return;
          swiper.a11y.init();
          swiper.a11y.updateNavigation();
        },
        toEdge() {
          const swiper = this;
          if (!swiper.params.a11y.enabled) return;
          swiper.a11y.updateNavigation();
        },
        fromEdge() {
          const swiper = this;
          if (!swiper.params.a11y.enabled) return;
          swiper.a11y.updateNavigation();
        },
        paginationUpdate() {
          const swiper = this;
          if (!swiper.params.a11y.enabled) return;
          swiper.a11y.updatePagination();
        },
        destroy() {
          const swiper = this;
          if (!swiper.params.a11y.enabled) return;
          swiper.a11y.destroy();
        },
      },
    };

    const History = {
      init() {
        const swiper = this;
        if (!swiper.params.history) return;
        if (!win.history || !win.history.pushState) {
          swiper.params.history.enabled = false;
          swiper.params.hashNavigation.enabled = true;
          return;
        }
        const history = swiper.history;
        history.initialized = true;
        history.paths = History.getPathValues();
        if (!history.paths.key && !history.paths.value) return;
        history.scrollToSlide(0, history.paths.value, swiper.params.runCallbacksOnInit);
        if (!swiper.params.history.replaceState) {
          win.addEventListener('popstate', swiper.history.setHistoryPopState);
        }
      },
      destroy() {
        const swiper = this;
        if (!swiper.params.history.replaceState) {
          win.removeEventListener('popstate', swiper.history.setHistoryPopState);
        }
      },
      setHistoryPopState() {
        const swiper = this;
        swiper.history.paths = History.getPathValues();
        swiper.history.scrollToSlide(swiper.params.speed, swiper.history.paths.value, false);
      },
      getPathValues() {
        const pathArray = win.location.pathname.slice(1).split('/').filter((part) => part !== '');
        const total = pathArray.length;
        const key = pathArray[total - 2];
        const value = pathArray[total - 1];
        return { key, value };
      },
      setHistory(key, index) {
        const swiper = this;
        if (!swiper.history.initialized || !swiper.params.history.enabled) return;
        const slide = swiper.slides.eq(index);
        let value = History.slugify(slide.attr('data-history'));
        if (!win.location.pathname.includes(key)) {
          value = `${key}/${value}`;
        }
        const currentState = win.history.state;
        if (currentState && currentState.value === value) {
          return;
        }
        if (swiper.params.history.replaceState) {
          win.history.replaceState({ value }, null, value);
        } else {
          win.history.pushState({ value }, null, value);
        }
      },
      slugify(text) {
        return text.toString()
          .replace(/\s+/g, '-')
          .replace(/[^\w-]+/g, '')
          .replace(/--+/g, '-')
          .replace(/^-+/, '')
          .replace(/-+$/, '');
      },
      scrollToSlide(speed, value, runCallbacks) {
        const swiper = this;
        if (value) {
          for (let i = 0, length = swiper.slides.length; i < length; i += 1) {
            const slide = swiper.slides.eq(i);
            const slideHistory = History.slugify(slide.attr('data-history'));
            if (slideHistory === value && !slide.hasClass(swiper.params.slideDuplicateClass)) {
              const index = slide.index();
              swiper.slideTo(index, speed, runCallbacks);
            }
          }
        } else {
          swiper.slideTo(0, speed, runCallbacks);
        }
      },
    };

    var History$1 = {
      name: 'history',
      params: {
        history: {
          enabled: false,
          replaceState: false,
          key: 'slides',
        },
      },
      create() {
        const swiper = this;
        Utils.extend(swiper, {
          history: {
            init: History.init.bind(swiper),
            setHistory: History.setHistory.bind(swiper),
            setHistoryPopState: History.setHistoryPopState.bind(swiper),
            scrollToSlide: History.scrollToSlide.bind(swiper),
            destroy: History.destroy.bind(swiper),
          },
        });
      },
      on: {
        init() {
          const swiper = this;
          if (swiper.params.history.enabled) {
            swiper.history.init();
          }
        },
        destroy() {
          const swiper = this;
          if (swiper.params.history.enabled) {
            swiper.history.destroy();
          }
        },
        transitionEnd() {
          const swiper = this;
          if (swiper.history.initialized) {
            swiper.history.setHistory(swiper.params.history.key, swiper.activeIndex);
          }
        },
      },
    };

    const HashNavigation = {
      onHashCange() {
        const swiper = this;
        const newHash = doc.location.hash.replace('#', '');
        const activeSlideHash = swiper.slides.eq(swiper.activeIndex).attr('data-hash');
        if (newHash !== activeSlideHash) {
          const newIndex = swiper.$wrapperEl.children(`.${swiper.params.slideClass}[data-hash="${newHash}"]`).index();
          if (typeof newIndex === 'undefined') return;
          swiper.slideTo(newIndex);
        }
      },
      setHash() {
        const swiper = this;
        if (!swiper.hashNavigation.initialized || !swiper.params.hashNavigation.enabled) return;
        if (swiper.params.hashNavigation.replaceState && win.history && win.history.replaceState) {
          win.history.replaceState(null, null, (`#${swiper.slides.eq(swiper.activeIndex).attr('data-hash')}` || ''));
        } else {
          const slide = swiper.slides.eq(swiper.activeIndex);
          const hash = slide.attr('data-hash') || slide.attr('data-history');
          doc.location.hash = hash || '';
        }
      },
      init() {
        const swiper = this;
        if (!swiper.params.hashNavigation.enabled || (swiper.params.history && swiper.params.history.enabled)) return;
        swiper.hashNavigation.initialized = true;
        const hash = doc.location.hash.replace('#', '');
        if (hash) {
          const speed = 0;
          for (let i = 0, length = swiper.slides.length; i < length; i += 1) {
            const slide = swiper.slides.eq(i);
            const slideHash = slide.attr('data-hash') || slide.attr('data-history');
            if (slideHash === hash && !slide.hasClass(swiper.params.slideDuplicateClass)) {
              const index = slide.index();
              swiper.slideTo(index, speed, swiper.params.runCallbacksOnInit, true);
            }
          }
        }
        if (swiper.params.hashNavigation.watchState) {
          $(win).on('hashchange', swiper.hashNavigation.onHashCange);
        }
      },
      destroy() {
        const swiper = this;
        if (swiper.params.hashNavigation.watchState) {
          $(win).off('hashchange', swiper.hashNavigation.onHashCange);
        }
      },
    };
    var HashNavigation$1 = {
      name: 'hash-navigation',
      params: {
        hashNavigation: {
          enabled: false,
          replaceState: false,
          watchState: false,
        },
      },
      create() {
        const swiper = this;
        Utils.extend(swiper, {
          hashNavigation: {
            initialized: false,
            init: HashNavigation.init.bind(swiper),
            destroy: HashNavigation.destroy.bind(swiper),
            setHash: HashNavigation.setHash.bind(swiper),
            onHashCange: HashNavigation.onHashCange.bind(swiper),
          },
        });
      },
      on: {
        init() {
          const swiper = this;
          if (swiper.params.hashNavigation.enabled) {
            swiper.hashNavigation.init();
          }
        },
        destroy() {
          const swiper = this;
          if (swiper.params.hashNavigation.enabled) {
            swiper.hashNavigation.destroy();
          }
        },
        transitionEnd() {
          const swiper = this;
          if (swiper.hashNavigation.initialized) {
            swiper.hashNavigation.setHash();
          }
        },
      },
    };

    /* eslint no-underscore-dangle: "off" */

    const Autoplay = {
      run() {
        const swiper = this;
        const $activeSlideEl = swiper.slides.eq(swiper.activeIndex);
        let delay = swiper.params.autoplay.delay;
        if ($activeSlideEl.attr('data-swiper-autoplay')) {
          delay = $activeSlideEl.attr('data-swiper-autoplay') || swiper.params.autoplay.delay;
        }
        clearTimeout(swiper.autoplay.timeout);
        swiper.autoplay.timeout = Utils.nextTick(() => {
          if (swiper.params.autoplay.reverseDirection) {
            if (swiper.params.loop) {
              swiper.loopFix();
              swiper.slidePrev(swiper.params.speed, true, true);
              swiper.emit('autoplay');
            } else if (!swiper.isBeginning) {
              swiper.slidePrev(swiper.params.speed, true, true);
              swiper.emit('autoplay');
            } else if (!swiper.params.autoplay.stopOnLastSlide) {
              swiper.slideTo(swiper.slides.length - 1, swiper.params.speed, true, true);
              swiper.emit('autoplay');
            } else {
              swiper.autoplay.stop();
            }
          } else if (swiper.params.loop) {
            swiper.loopFix();
            swiper.slideNext(swiper.params.speed, true, true);
            swiper.emit('autoplay');
          } else if (!swiper.isEnd) {
            swiper.slideNext(swiper.params.speed, true, true);
            swiper.emit('autoplay');
          } else if (!swiper.params.autoplay.stopOnLastSlide) {
            swiper.slideTo(0, swiper.params.speed, true, true);
            swiper.emit('autoplay');
          } else {
            swiper.autoplay.stop();
          }
        }, delay);
      },
      start() {
        const swiper = this;
        if (typeof swiper.autoplay.timeout !== 'undefined') return false;
        if (swiper.autoplay.running) return false;
        swiper.autoplay.running = true;
        swiper.emit('autoplayStart');
        swiper.autoplay.run();
        return true;
      },
      stop() {
        const swiper = this;
        if (!swiper.autoplay.running) return false;
        if (typeof swiper.autoplay.timeout === 'undefined') return false;

        if (swiper.autoplay.timeout) {
          clearTimeout(swiper.autoplay.timeout);
          swiper.autoplay.timeout = undefined;
        }
        swiper.autoplay.running = false;
        swiper.emit('autoplayStop');
        return true;
      },
      pause(speed) {
        const swiper = this;
        if (!swiper.autoplay.running) return;
        if (swiper.autoplay.paused) return;
        if (swiper.autoplay.timeout) clearTimeout(swiper.autoplay.timeout);
        swiper.autoplay.paused = true;
        if (speed === 0 || !swiper.params.autoplay.waitForTransition) {
          swiper.autoplay.paused = false;
          swiper.autoplay.run();
        } else {
          swiper.$wrapperEl[0].addEventListener('transitionend', swiper.autoplay.onTransitionEnd);
          swiper.$wrapperEl[0].addEventListener('webkitTransitionEnd', swiper.autoplay.onTransitionEnd);
        }
      },
    };

    var Autoplay$1 = {
      name: 'autoplay',
      params: {
        autoplay: {
          enabled: false,
          delay: 3000,
          waitForTransition: true,
          disableOnInteraction: true,
          stopOnLastSlide: false,
          reverseDirection: false,
        },
      },
      create() {
        const swiper = this;
        Utils.extend(swiper, {
          autoplay: {
            running: false,
            paused: false,
            run: Autoplay.run.bind(swiper),
            start: Autoplay.start.bind(swiper),
            stop: Autoplay.stop.bind(swiper),
            pause: Autoplay.pause.bind(swiper),
            onTransitionEnd(e) {
              if (!swiper || swiper.destroyed || !swiper.$wrapperEl) return;
              if (e.target !== this) return;
              swiper.$wrapperEl[0].removeEventListener('transitionend', swiper.autoplay.onTransitionEnd);
              swiper.$wrapperEl[0].removeEventListener('webkitTransitionEnd', swiper.autoplay.onTransitionEnd);
              swiper.autoplay.paused = false;
              if (!swiper.autoplay.running) {
                swiper.autoplay.stop();
              } else {
                swiper.autoplay.run();
              }
            },
          },
        });
      },
      on: {
        init() {
          const swiper = this;
          if (swiper.params.autoplay.enabled) {
            swiper.autoplay.start();
          }
        },
        beforeTransitionStart(speed, internal) {
          const swiper = this;
          if (swiper.autoplay.running) {
            if (internal || !swiper.params.autoplay.disableOnInteraction) {
              swiper.autoplay.pause(speed);
            } else {
              swiper.autoplay.stop();
            }
          }
        },
        sliderFirstMove() {
          const swiper = this;
          if (swiper.autoplay.running) {
            if (swiper.params.autoplay.disableOnInteraction) {
              swiper.autoplay.stop();
            } else {
              swiper.autoplay.pause();
            }
          }
        },
        destroy() {
          const swiper = this;
          if (swiper.autoplay.running) {
            swiper.autoplay.stop();
          }
        },
      },
    };

    const Fade = {
      setTranslate() {
        const swiper = this;
        const { slides } = swiper;
        for (let i = 0; i < slides.length; i += 1) {
          const $slideEl = swiper.slides.eq(i);
          const offset = $slideEl[0].swiperSlideOffset;
          let tx = -offset;
          if (!swiper.params.virtualTranslate) tx -= swiper.translate;
          let ty = 0;
          if (!swiper.isHorizontal()) {
            ty = tx;
            tx = 0;
          }
          const slideOpacity = swiper.params.fadeEffect.crossFade
            ? Math.max(1 - Math.abs($slideEl[0].progress), 0)
            : 1 + Math.min(Math.max($slideEl[0].progress, -1), 0);
          $slideEl
            .css({
              opacity: slideOpacity,
            })
            .transform(`translate3d(${tx}px, ${ty}px, 0px)`);
        }
      },
      setTransition(duration) {
        const swiper = this;
        const { slides, $wrapperEl } = swiper;
        slides.transition(duration);
        if (swiper.params.virtualTranslate && duration !== 0) {
          let eventTriggered = false;
          slides.transitionEnd(() => {
            if (eventTriggered) return;
            if (!swiper || swiper.destroyed) return;
            eventTriggered = true;
            swiper.animating = false;
            const triggerEvents = ['webkitTransitionEnd', 'transitionend'];
            for (let i = 0; i < triggerEvents.length; i += 1) {
              $wrapperEl.trigger(triggerEvents[i]);
            }
          });
        }
      },
    };

    var EffectFade = {
      name: 'effect-fade',
      params: {
        fadeEffect: {
          crossFade: false,
        },
      },
      create() {
        const swiper = this;
        Utils.extend(swiper, {
          fadeEffect: {
            setTranslate: Fade.setTranslate.bind(swiper),
            setTransition: Fade.setTransition.bind(swiper),
          },
        });
      },
      on: {
        beforeInit() {
          const swiper = this;
          if (swiper.params.effect !== 'fade') return;
          swiper.classNames.push(`${swiper.params.containerModifierClass}fade`);
          const overwriteParams = {
            slidesPerView: 1,
            slidesPerColumn: 1,
            slidesPerGroup: 1,
            watchSlidesProgress: true,
            spaceBetween: 0,
            virtualTranslate: true,
          };
          Utils.extend(swiper.params, overwriteParams);
          Utils.extend(swiper.originalParams, overwriteParams);
        },
        setTranslate() {
          const swiper = this;
          if (swiper.params.effect !== 'fade') return;
          swiper.fadeEffect.setTranslate();
        },
        setTransition(duration) {
          const swiper = this;
          if (swiper.params.effect !== 'fade') return;
          swiper.fadeEffect.setTransition(duration);
        },
      },
    };

    const Cube = {
      setTranslate() {
        const swiper = this;
        const {
          $el, $wrapperEl, slides, width: swiperWidth, height: swiperHeight, rtlTranslate: rtl, size: swiperSize,
        } = swiper;
        const params = swiper.params.cubeEffect;
        const isHorizontal = swiper.isHorizontal();
        const isVirtual = swiper.virtual && swiper.params.virtual.enabled;
        let wrapperRotate = 0;
        let $cubeShadowEl;
        if (params.shadow) {
          if (isHorizontal) {
            $cubeShadowEl = $wrapperEl.find('.swiper-cube-shadow');
            if ($cubeShadowEl.length === 0) {
              $cubeShadowEl = $('<div class="swiper-cube-shadow"></div>');
              $wrapperEl.append($cubeShadowEl);
            }
            $cubeShadowEl.css({ height: `${swiperWidth}px` });
          } else {
            $cubeShadowEl = $el.find('.swiper-cube-shadow');
            if ($cubeShadowEl.length === 0) {
              $cubeShadowEl = $('<div class="swiper-cube-shadow"></div>');
              $el.append($cubeShadowEl);
            }
          }
        }
        for (let i = 0; i < slides.length; i += 1) {
          const $slideEl = slides.eq(i);
          let slideIndex = i;
          if (isVirtual) {
            slideIndex = parseInt($slideEl.attr('data-swiper-slide-index'), 10);
          }
          let slideAngle = slideIndex * 90;
          let round = Math.floor(slideAngle / 360);
          if (rtl) {
            slideAngle = -slideAngle;
            round = Math.floor(-slideAngle / 360);
          }
          const progress = Math.max(Math.min($slideEl[0].progress, 1), -1);
          let tx = 0;
          let ty = 0;
          let tz = 0;
          if (slideIndex % 4 === 0) {
            tx = -round * 4 * swiperSize;
            tz = 0;
          } else if ((slideIndex - 1) % 4 === 0) {
            tx = 0;
            tz = -round * 4 * swiperSize;
          } else if ((slideIndex - 2) % 4 === 0) {
            tx = swiperSize + (round * 4 * swiperSize);
            tz = swiperSize;
          } else if ((slideIndex - 3) % 4 === 0) {
            tx = -swiperSize;
            tz = (3 * swiperSize) + (swiperSize * 4 * round);
          }
          if (rtl) {
            tx = -tx;
          }

          if (!isHorizontal) {
            ty = tx;
            tx = 0;
          }

          const transform = `rotateX(${isHorizontal ? 0 : -slideAngle}deg) rotateY(${isHorizontal ? slideAngle : 0}deg) translate3d(${tx}px, ${ty}px, ${tz}px)`;
          if (progress <= 1 && progress > -1) {
            wrapperRotate = (slideIndex * 90) + (progress * 90);
            if (rtl) wrapperRotate = (-slideIndex * 90) - (progress * 90);
          }
          $slideEl.transform(transform);
          if (params.slideShadows) {
            // Set shadows
            let shadowBefore = isHorizontal ? $slideEl.find('.swiper-slide-shadow-left') : $slideEl.find('.swiper-slide-shadow-top');
            let shadowAfter = isHorizontal ? $slideEl.find('.swiper-slide-shadow-right') : $slideEl.find('.swiper-slide-shadow-bottom');
            if (shadowBefore.length === 0) {
              shadowBefore = $(`<div class="swiper-slide-shadow-${isHorizontal ? 'left' : 'top'}"></div>`);
              $slideEl.append(shadowBefore);
            }
            if (shadowAfter.length === 0) {
              shadowAfter = $(`<div class="swiper-slide-shadow-${isHorizontal ? 'right' : 'bottom'}"></div>`);
              $slideEl.append(shadowAfter);
            }
            if (shadowBefore.length) shadowBefore[0].style.opacity = Math.max(-progress, 0);
            if (shadowAfter.length) shadowAfter[0].style.opacity = Math.max(progress, 0);
          }
        }
        $wrapperEl.css({
          '-webkit-transform-origin': `50% 50% -${swiperSize / 2}px`,
          '-moz-transform-origin': `50% 50% -${swiperSize / 2}px`,
          '-ms-transform-origin': `50% 50% -${swiperSize / 2}px`,
          'transform-origin': `50% 50% -${swiperSize / 2}px`,
        });

        if (params.shadow) {
          if (isHorizontal) {
            $cubeShadowEl.transform(`translate3d(0px, ${(swiperWidth / 2) + params.shadowOffset}px, ${-swiperWidth / 2}px) rotateX(90deg) rotateZ(0deg) scale(${params.shadowScale})`);
          } else {
            const shadowAngle = Math.abs(wrapperRotate) - (Math.floor(Math.abs(wrapperRotate) / 90) * 90);
            const multiplier = 1.5 - (
              (Math.sin((shadowAngle * 2 * Math.PI) / 360) / 2)
              + (Math.cos((shadowAngle * 2 * Math.PI) / 360) / 2)
            );
            const scale1 = params.shadowScale;
            const scale2 = params.shadowScale / multiplier;
            const offset = params.shadowOffset;
            $cubeShadowEl.transform(`scale3d(${scale1}, 1, ${scale2}) translate3d(0px, ${(swiperHeight / 2) + offset}px, ${-swiperHeight / 2 / scale2}px) rotateX(-90deg)`);
          }
        }
        const zFactor = (Browser.isSafari || Browser.isUiWebView) ? (-swiperSize / 2) : 0;
        $wrapperEl
          .transform(`translate3d(0px,0,${zFactor}px) rotateX(${swiper.isHorizontal() ? 0 : wrapperRotate}deg) rotateY(${swiper.isHorizontal() ? -wrapperRotate : 0}deg)`);
      },
      setTransition(duration) {
        const swiper = this;
        const { $el, slides } = swiper;
        slides
          .transition(duration)
          .find('.swiper-slide-shadow-top, .swiper-slide-shadow-right, .swiper-slide-shadow-bottom, .swiper-slide-shadow-left')
          .transition(duration);
        if (swiper.params.cubeEffect.shadow && !swiper.isHorizontal()) {
          $el.find('.swiper-cube-shadow').transition(duration);
        }
      },
    };

    var EffectCube = {
      name: 'effect-cube',
      params: {
        cubeEffect: {
          slideShadows: true,
          shadow: true,
          shadowOffset: 20,
          shadowScale: 0.94,
        },
      },
      create() {
        const swiper = this;
        Utils.extend(swiper, {
          cubeEffect: {
            setTranslate: Cube.setTranslate.bind(swiper),
            setTransition: Cube.setTransition.bind(swiper),
          },
        });
      },
      on: {
        beforeInit() {
          const swiper = this;
          if (swiper.params.effect !== 'cube') return;
          swiper.classNames.push(`${swiper.params.containerModifierClass}cube`);
          swiper.classNames.push(`${swiper.params.containerModifierClass}3d`);
          const overwriteParams = {
            slidesPerView: 1,
            slidesPerColumn: 1,
            slidesPerGroup: 1,
            watchSlidesProgress: true,
            resistanceRatio: 0,
            spaceBetween: 0,
            centeredSlides: false,
            virtualTranslate: true,
          };
          Utils.extend(swiper.params, overwriteParams);
          Utils.extend(swiper.originalParams, overwriteParams);
        },
        setTranslate() {
          const swiper = this;
          if (swiper.params.effect !== 'cube') return;
          swiper.cubeEffect.setTranslate();
        },
        setTransition(duration) {
          const swiper = this;
          if (swiper.params.effect !== 'cube') return;
          swiper.cubeEffect.setTransition(duration);
        },
      },
    };

    const Flip = {
      setTranslate() {
        const swiper = this;
        const { slides, rtlTranslate: rtl } = swiper;
        for (let i = 0; i < slides.length; i += 1) {
          const $slideEl = slides.eq(i);
          let progress = $slideEl[0].progress;
          if (swiper.params.flipEffect.limitRotation) {
            progress = Math.max(Math.min($slideEl[0].progress, 1), -1);
          }
          const offset = $slideEl[0].swiperSlideOffset;
          const rotate = -180 * progress;
          let rotateY = rotate;
          let rotateX = 0;
          let tx = -offset;
          let ty = 0;
          if (!swiper.isHorizontal()) {
            ty = tx;
            tx = 0;
            rotateX = -rotateY;
            rotateY = 0;
          } else if (rtl) {
            rotateY = -rotateY;
          }

          $slideEl[0].style.zIndex = -Math.abs(Math.round(progress)) + slides.length;

          if (swiper.params.flipEffect.slideShadows) {
            // Set shadows
            let shadowBefore = swiper.isHorizontal() ? $slideEl.find('.swiper-slide-shadow-left') : $slideEl.find('.swiper-slide-shadow-top');
            let shadowAfter = swiper.isHorizontal() ? $slideEl.find('.swiper-slide-shadow-right') : $slideEl.find('.swiper-slide-shadow-bottom');
            if (shadowBefore.length === 0) {
              shadowBefore = $(`<div class="swiper-slide-shadow-${swiper.isHorizontal() ? 'left' : 'top'}"></div>`);
              $slideEl.append(shadowBefore);
            }
            if (shadowAfter.length === 0) {
              shadowAfter = $(`<div class="swiper-slide-shadow-${swiper.isHorizontal() ? 'right' : 'bottom'}"></div>`);
              $slideEl.append(shadowAfter);
            }
            if (shadowBefore.length) shadowBefore[0].style.opacity = Math.max(-progress, 0);
            if (shadowAfter.length) shadowAfter[0].style.opacity = Math.max(progress, 0);
          }
          $slideEl
            .transform(`translate3d(${tx}px, ${ty}px, 0px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`);
        }
      },
      setTransition(duration) {
        const swiper = this;
        const { slides, activeIndex, $wrapperEl } = swiper;
        slides
          .transition(duration)
          .find('.swiper-slide-shadow-top, .swiper-slide-shadow-right, .swiper-slide-shadow-bottom, .swiper-slide-shadow-left')
          .transition(duration);
        if (swiper.params.virtualTranslate && duration !== 0) {
          let eventTriggered = false;
          // eslint-disable-next-line
          slides.eq(activeIndex).transitionEnd(function onTransitionEnd() {
            if (eventTriggered) return;
            if (!swiper || swiper.destroyed) return;
            // if (!$(this).hasClass(swiper.params.slideActiveClass)) return;
            eventTriggered = true;
            swiper.animating = false;
            const triggerEvents = ['webkitTransitionEnd', 'transitionend'];
            for (let i = 0; i < triggerEvents.length; i += 1) {
              $wrapperEl.trigger(triggerEvents[i]);
            }
          });
        }
      },
    };

    var EffectFlip = {
      name: 'effect-flip',
      params: {
        flipEffect: {
          slideShadows: true,
          limitRotation: true,
        },
      },
      create() {
        const swiper = this;
        Utils.extend(swiper, {
          flipEffect: {
            setTranslate: Flip.setTranslate.bind(swiper),
            setTransition: Flip.setTransition.bind(swiper),
          },
        });
      },
      on: {
        beforeInit() {
          const swiper = this;
          if (swiper.params.effect !== 'flip') return;
          swiper.classNames.push(`${swiper.params.containerModifierClass}flip`);
          swiper.classNames.push(`${swiper.params.containerModifierClass}3d`);
          const overwriteParams = {
            slidesPerView: 1,
            slidesPerColumn: 1,
            slidesPerGroup: 1,
            watchSlidesProgress: true,
            spaceBetween: 0,
            virtualTranslate: true,
          };
          Utils.extend(swiper.params, overwriteParams);
          Utils.extend(swiper.originalParams, overwriteParams);
        },
        setTranslate() {
          const swiper = this;
          if (swiper.params.effect !== 'flip') return;
          swiper.flipEffect.setTranslate();
        },
        setTransition(duration) {
          const swiper = this;
          if (swiper.params.effect !== 'flip') return;
          swiper.flipEffect.setTransition(duration);
        },
      },
    };

    const Coverflow = {
      setTranslate() {
        const swiper = this;
        const {
          width: swiperWidth, height: swiperHeight, slides, $wrapperEl, slidesSizesGrid,
        } = swiper;
        const params = swiper.params.coverflowEffect;
        const isHorizontal = swiper.isHorizontal();
        const transform = swiper.translate;
        const center = isHorizontal ? -transform + (swiperWidth / 2) : -transform + (swiperHeight / 2);
        const rotate = isHorizontal ? params.rotate : -params.rotate;
        const translate = params.depth;
        // Each slide offset from center
        for (let i = 0, length = slides.length; i < length; i += 1) {
          const $slideEl = slides.eq(i);
          const slideSize = slidesSizesGrid[i];
          const slideOffset = $slideEl[0].swiperSlideOffset;
          const offsetMultiplier = ((center - slideOffset - (slideSize / 2)) / slideSize) * params.modifier;

          let rotateY = isHorizontal ? rotate * offsetMultiplier : 0;
          let rotateX = isHorizontal ? 0 : rotate * offsetMultiplier;
          // var rotateZ = 0
          let translateZ = -translate * Math.abs(offsetMultiplier);

          let translateY = isHorizontal ? 0 : params.stretch * (offsetMultiplier);
          let translateX = isHorizontal ? params.stretch * (offsetMultiplier) : 0;

          // Fix for ultra small values
          if (Math.abs(translateX) < 0.001) translateX = 0;
          if (Math.abs(translateY) < 0.001) translateY = 0;
          if (Math.abs(translateZ) < 0.001) translateZ = 0;
          if (Math.abs(rotateY) < 0.001) rotateY = 0;
          if (Math.abs(rotateX) < 0.001) rotateX = 0;

          const slideTransform = `translate3d(${translateX}px,${translateY}px,${translateZ}px)  rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;

          $slideEl.transform(slideTransform);
          $slideEl[0].style.zIndex = -Math.abs(Math.round(offsetMultiplier)) + 1;
          if (params.slideShadows) {
            // Set shadows
            let $shadowBeforeEl = isHorizontal ? $slideEl.find('.swiper-slide-shadow-left') : $slideEl.find('.swiper-slide-shadow-top');
            let $shadowAfterEl = isHorizontal ? $slideEl.find('.swiper-slide-shadow-right') : $slideEl.find('.swiper-slide-shadow-bottom');
            if ($shadowBeforeEl.length === 0) {
              $shadowBeforeEl = $(`<div class="swiper-slide-shadow-${isHorizontal ? 'left' : 'top'}"></div>`);
              $slideEl.append($shadowBeforeEl);
            }
            if ($shadowAfterEl.length === 0) {
              $shadowAfterEl = $(`<div class="swiper-slide-shadow-${isHorizontal ? 'right' : 'bottom'}"></div>`);
              $slideEl.append($shadowAfterEl);
            }
            if ($shadowBeforeEl.length) $shadowBeforeEl[0].style.opacity = offsetMultiplier > 0 ? offsetMultiplier : 0;
            if ($shadowAfterEl.length) $shadowAfterEl[0].style.opacity = (-offsetMultiplier) > 0 ? -offsetMultiplier : 0;
          }
        }

        // Set correct perspective for IE10
        if (Support.pointerEvents || Support.prefixedPointerEvents) {
          const ws = $wrapperEl[0].style;
          ws.perspectiveOrigin = `${center}px 50%`;
        }
      },
      setTransition(duration) {
        const swiper = this;
        swiper.slides
          .transition(duration)
          .find('.swiper-slide-shadow-top, .swiper-slide-shadow-right, .swiper-slide-shadow-bottom, .swiper-slide-shadow-left')
          .transition(duration);
      },
    };

    var EffectCoverflow = {
      name: 'effect-coverflow',
      params: {
        coverflowEffect: {
          rotate: 50,
          stretch: 0,
          depth: 100,
          modifier: 1,
          slideShadows: true,
        },
      },
      create() {
        const swiper = this;
        Utils.extend(swiper, {
          coverflowEffect: {
            setTranslate: Coverflow.setTranslate.bind(swiper),
            setTransition: Coverflow.setTransition.bind(swiper),
          },
        });
      },
      on: {
        beforeInit() {
          const swiper = this;
          if (swiper.params.effect !== 'coverflow') return;

          swiper.classNames.push(`${swiper.params.containerModifierClass}coverflow`);
          swiper.classNames.push(`${swiper.params.containerModifierClass}3d`);

          swiper.params.watchSlidesProgress = true;
          swiper.originalParams.watchSlidesProgress = true;
        },
        setTranslate() {
          const swiper = this;
          if (swiper.params.effect !== 'coverflow') return;
          swiper.coverflowEffect.setTranslate();
        },
        setTransition(duration) {
          const swiper = this;
          if (swiper.params.effect !== 'coverflow') return;
          swiper.coverflowEffect.setTransition(duration);
        },
      },
    };

    const Thumbs = {
      init() {
        const swiper = this;
        const { thumbs: thumbsParams } = swiper.params;
        const SwiperClass = swiper.constructor;
        if (thumbsParams.swiper instanceof SwiperClass) {
          swiper.thumbs.swiper = thumbsParams.swiper;
          Utils.extend(swiper.thumbs.swiper.originalParams, {
            watchSlidesProgress: true,
            slideToClickedSlide: false,
          });
          Utils.extend(swiper.thumbs.swiper.params, {
            watchSlidesProgress: true,
            slideToClickedSlide: false,
          });
        } else if (Utils.isObject(thumbsParams.swiper)) {
          swiper.thumbs.swiper = new SwiperClass(Utils.extend({}, thumbsParams.swiper, {
            watchSlidesVisibility: true,
            watchSlidesProgress: true,
            slideToClickedSlide: false,
          }));
          swiper.thumbs.swiperCreated = true;
        }
        swiper.thumbs.swiper.$el.addClass(swiper.params.thumbs.thumbsContainerClass);
        swiper.thumbs.swiper.on('tap', swiper.thumbs.onThumbClick);
      },
      onThumbClick() {
        const swiper = this;
        const thumbsSwiper = swiper.thumbs.swiper;
        if (!thumbsSwiper) return;
        const clickedIndex = thumbsSwiper.clickedIndex;
        const clickedSlide = thumbsSwiper.clickedSlide;
        if (clickedSlide && $(clickedSlide).hasClass(swiper.params.thumbs.slideThumbActiveClass)) return;
        if (typeof clickedIndex === 'undefined' || clickedIndex === null) return;
        let slideToIndex;
        if (thumbsSwiper.params.loop) {
          slideToIndex = parseInt($(thumbsSwiper.clickedSlide).attr('data-swiper-slide-index'), 10);
        } else {
          slideToIndex = clickedIndex;
        }
        if (swiper.params.loop) {
          let currentIndex = swiper.activeIndex;
          if (swiper.slides.eq(currentIndex).hasClass(swiper.params.slideDuplicateClass)) {
            swiper.loopFix();
            // eslint-disable-next-line
            swiper._clientLeft = swiper.$wrapperEl[0].clientLeft;
            currentIndex = swiper.activeIndex;
          }
          const prevIndex = swiper.slides.eq(currentIndex).prevAll(`[data-swiper-slide-index="${slideToIndex}"]`).eq(0).index();
          const nextIndex = swiper.slides.eq(currentIndex).nextAll(`[data-swiper-slide-index="${slideToIndex}"]`).eq(0).index();
          if (typeof prevIndex === 'undefined') slideToIndex = nextIndex;
          else if (typeof nextIndex === 'undefined') slideToIndex = prevIndex;
          else if (nextIndex - currentIndex < currentIndex - prevIndex) slideToIndex = nextIndex;
          else slideToIndex = prevIndex;
        }
        swiper.slideTo(slideToIndex);
      },
      update(initial) {
        const swiper = this;
        const thumbsSwiper = swiper.thumbs.swiper;
        if (!thumbsSwiper) return;

        const slidesPerView = thumbsSwiper.params.slidesPerView === 'auto'
          ? thumbsSwiper.slidesPerViewDynamic()
          : thumbsSwiper.params.slidesPerView;

        if (swiper.realIndex !== thumbsSwiper.realIndex) {
          let currentThumbsIndex = thumbsSwiper.activeIndex;
          let newThumbsIndex;
          if (thumbsSwiper.params.loop) {
            if (thumbsSwiper.slides.eq(currentThumbsIndex).hasClass(thumbsSwiper.params.slideDuplicateClass)) {
              thumbsSwiper.loopFix();
              // eslint-disable-next-line
              thumbsSwiper._clientLeft = thumbsSwiper.$wrapperEl[0].clientLeft;
              currentThumbsIndex = thumbsSwiper.activeIndex;
            }
            // Find actual thumbs index to slide to
            const prevThumbsIndex = thumbsSwiper.slides.eq(currentThumbsIndex).prevAll(`[data-swiper-slide-index="${swiper.realIndex}"]`).eq(0).index();
            const nextThumbsIndex = thumbsSwiper.slides.eq(currentThumbsIndex).nextAll(`[data-swiper-slide-index="${swiper.realIndex}"]`).eq(0).index();
            if (typeof prevThumbsIndex === 'undefined') newThumbsIndex = nextThumbsIndex;
            else if (typeof nextThumbsIndex === 'undefined') newThumbsIndex = prevThumbsIndex;
            else if (nextThumbsIndex - currentThumbsIndex === currentThumbsIndex - prevThumbsIndex) newThumbsIndex = currentThumbsIndex;
            else if (nextThumbsIndex - currentThumbsIndex < currentThumbsIndex - prevThumbsIndex) newThumbsIndex = nextThumbsIndex;
            else newThumbsIndex = prevThumbsIndex;
          } else {
            newThumbsIndex = swiper.realIndex;
          }
          if (thumbsSwiper.visibleSlidesIndexes && thumbsSwiper.visibleSlidesIndexes.indexOf(newThumbsIndex) < 0) {
            if (thumbsSwiper.params.centeredSlides) {
              if (newThumbsIndex > currentThumbsIndex) {
                newThumbsIndex = newThumbsIndex - Math.floor(slidesPerView / 2) + 1;
              } else {
                newThumbsIndex = newThumbsIndex + Math.floor(slidesPerView / 2) - 1;
              }
            } else if (newThumbsIndex > currentThumbsIndex) {
              newThumbsIndex = newThumbsIndex - slidesPerView + 1;
            }
            thumbsSwiper.slideTo(newThumbsIndex, initial ? 0 : undefined);
          }
        }

        // Activate thumbs
        let thumbsToActivate = 1;
        const thumbActiveClass = swiper.params.thumbs.slideThumbActiveClass;

        if (swiper.params.slidesPerView > 1 && !swiper.params.centeredSlides) {
          thumbsToActivate = swiper.params.slidesPerView;
        }

        thumbsSwiper.slides.removeClass(thumbActiveClass);
        if (thumbsSwiper.params.loop || thumbsSwiper.params.virtual) {
          for (let i = 0; i < thumbsToActivate; i += 1) {
            thumbsSwiper.$wrapperEl.children(`[data-swiper-slide-index="${swiper.realIndex + i}"]`).addClass(thumbActiveClass);
          }
        } else {
          for (let i = 0; i < thumbsToActivate; i += 1) {
            thumbsSwiper.slides.eq(swiper.realIndex + i).addClass(thumbActiveClass);
          }
        }
      },
    };
    var Thumbs$1 = {
      name: 'thumbs',
      params: {
        thumbs: {
          swiper: null,
          slideThumbActiveClass: 'swiper-slide-thumb-active',
          thumbsContainerClass: 'swiper-container-thumbs',
        },
      },
      create() {
        const swiper = this;
        Utils.extend(swiper, {
          thumbs: {
            swiper: null,
            init: Thumbs.init.bind(swiper),
            update: Thumbs.update.bind(swiper),
            onThumbClick: Thumbs.onThumbClick.bind(swiper),
          },
        });
      },
      on: {
        beforeInit() {
          const swiper = this;
          const { thumbs } = swiper.params;
          if (!thumbs || !thumbs.swiper) return;
          swiper.thumbs.init();
          swiper.thumbs.update(true);
        },
        slideChange() {
          const swiper = this;
          if (!swiper.thumbs.swiper) return;
          swiper.thumbs.update();
        },
        update() {
          const swiper = this;
          if (!swiper.thumbs.swiper) return;
          swiper.thumbs.update();
        },
        resize() {
          const swiper = this;
          if (!swiper.thumbs.swiper) return;
          swiper.thumbs.update();
        },
        observerUpdate() {
          const swiper = this;
          if (!swiper.thumbs.swiper) return;
          swiper.thumbs.update();
        },
        setTransition(duration) {
          const swiper = this;
          const thumbsSwiper = swiper.thumbs.swiper;
          if (!thumbsSwiper) return;
          thumbsSwiper.setTransition(duration);
        },
        beforeDestroy() {
          const swiper = this;
          const thumbsSwiper = swiper.thumbs.swiper;
          if (!thumbsSwiper) return;
          if (swiper.thumbs.swiperCreated && thumbsSwiper) {
            thumbsSwiper.destroy();
          }
        },
      },
    };

    // Swiper Class

    const components = [
      Device$1,
      Support$1,
      Browser$1,
      Resize,
      Observer$1,
      Virtual$1,
      Keyboard$1,
      Mousewheel$1,
      Navigation$1,
      Pagination$1,
      Scrollbar$1,
      Parallax$1,
      Zoom$1,
      Lazy$1,
      Controller$1,
      A11y,
      History$1,
      HashNavigation$1,
      Autoplay$1,
      EffectFade,
      EffectCube,
      EffectFlip,
      EffectCoverflow,
      Thumbs$1
    ];

    if (typeof Swiper.use === 'undefined') {
      Swiper.use = Swiper.Class.use;
      Swiper.installModule = Swiper.Class.installModule;
    }

    Swiper.use(components);

    var bind = function bind(fn, thisArg) {
      return function wrap() {
        var args = new Array(arguments.length);
        for (var i = 0; i < args.length; i++) {
          args[i] = arguments[i];
        }
        return fn.apply(thisArg, args);
      };
    };

    /*global toString:true*/

    // utils is a library of generic helper functions non-specific to axios

    var toString = Object.prototype.toString;

    /**
     * Determine if a value is an Array
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is an Array, otherwise false
     */
    function isArray(val) {
      return toString.call(val) === '[object Array]';
    }

    /**
     * Determine if a value is undefined
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if the value is undefined, otherwise false
     */
    function isUndefined(val) {
      return typeof val === 'undefined';
    }

    /**
     * Determine if a value is a Buffer
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a Buffer, otherwise false
     */
    function isBuffer(val) {
      return val !== null && !isUndefined(val) && val.constructor !== null && !isUndefined(val.constructor)
        && typeof val.constructor.isBuffer === 'function' && val.constructor.isBuffer(val);
    }

    /**
     * Determine if a value is an ArrayBuffer
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is an ArrayBuffer, otherwise false
     */
    function isArrayBuffer(val) {
      return toString.call(val) === '[object ArrayBuffer]';
    }

    /**
     * Determine if a value is a FormData
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is an FormData, otherwise false
     */
    function isFormData(val) {
      return (typeof FormData !== 'undefined') && (val instanceof FormData);
    }

    /**
     * Determine if a value is a view on an ArrayBuffer
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a view on an ArrayBuffer, otherwise false
     */
    function isArrayBufferView(val) {
      var result;
      if ((typeof ArrayBuffer !== 'undefined') && (ArrayBuffer.isView)) {
        result = ArrayBuffer.isView(val);
      } else {
        result = (val) && (val.buffer) && (val.buffer instanceof ArrayBuffer);
      }
      return result;
    }

    /**
     * Determine if a value is a String
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a String, otherwise false
     */
    function isString(val) {
      return typeof val === 'string';
    }

    /**
     * Determine if a value is a Number
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a Number, otherwise false
     */
    function isNumber(val) {
      return typeof val === 'number';
    }

    /**
     * Determine if a value is an Object
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is an Object, otherwise false
     */
    function isObject(val) {
      return val !== null && typeof val === 'object';
    }

    /**
     * Determine if a value is a Date
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a Date, otherwise false
     */
    function isDate(val) {
      return toString.call(val) === '[object Date]';
    }

    /**
     * Determine if a value is a File
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a File, otherwise false
     */
    function isFile(val) {
      return toString.call(val) === '[object File]';
    }

    /**
     * Determine if a value is a Blob
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a Blob, otherwise false
     */
    function isBlob(val) {
      return toString.call(val) === '[object Blob]';
    }

    /**
     * Determine if a value is a Function
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a Function, otherwise false
     */
    function isFunction(val) {
      return toString.call(val) === '[object Function]';
    }

    /**
     * Determine if a value is a Stream
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a Stream, otherwise false
     */
    function isStream(val) {
      return isObject(val) && isFunction(val.pipe);
    }

    /**
     * Determine if a value is a URLSearchParams object
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a URLSearchParams object, otherwise false
     */
    function isURLSearchParams(val) {
      return typeof URLSearchParams !== 'undefined' && val instanceof URLSearchParams;
    }

    /**
     * Trim excess whitespace off the beginning and end of a string
     *
     * @param {String} str The String to trim
     * @returns {String} The String freed of excess whitespace
     */
    function trim(str) {
      return str.replace(/^\s*/, '').replace(/\s*$/, '');
    }

    /**
     * Determine if we're running in a standard browser environment
     *
     * This allows axios to run in a web worker, and react-native.
     * Both environments support XMLHttpRequest, but not fully standard globals.
     *
     * web workers:
     *  typeof window -> undefined
     *  typeof document -> undefined
     *
     * react-native:
     *  navigator.product -> 'ReactNative'
     * nativescript
     *  navigator.product -> 'NativeScript' or 'NS'
     */
    function isStandardBrowserEnv() {
      if (typeof navigator !== 'undefined' && (navigator.product === 'ReactNative' ||
                                               navigator.product === 'NativeScript' ||
                                               navigator.product === 'NS')) {
        return false;
      }
      return (
        typeof window !== 'undefined' &&
        typeof document !== 'undefined'
      );
    }

    /**
     * Iterate over an Array or an Object invoking a function for each item.
     *
     * If `obj` is an Array callback will be called passing
     * the value, index, and complete array for each item.
     *
     * If 'obj' is an Object callback will be called passing
     * the value, key, and complete object for each property.
     *
     * @param {Object|Array} obj The object to iterate
     * @param {Function} fn The callback to invoke for each item
     */
    function forEach(obj, fn) {
      // Don't bother if no value provided
      if (obj === null || typeof obj === 'undefined') {
        return;
      }

      // Force an array if not already something iterable
      if (typeof obj !== 'object') {
        /*eslint no-param-reassign:0*/
        obj = [obj];
      }

      if (isArray(obj)) {
        // Iterate over array values
        for (var i = 0, l = obj.length; i < l; i++) {
          fn.call(null, obj[i], i, obj);
        }
      } else {
        // Iterate over object keys
        for (var key in obj) {
          if (Object.prototype.hasOwnProperty.call(obj, key)) {
            fn.call(null, obj[key], key, obj);
          }
        }
      }
    }

    /**
     * Accepts varargs expecting each argument to be an object, then
     * immutably merges the properties of each object and returns result.
     *
     * When multiple objects contain the same key the later object in
     * the arguments list will take precedence.
     *
     * Example:
     *
     * ```js
     * var result = merge({foo: 123}, {foo: 456});
     * console.log(result.foo); // outputs 456
     * ```
     *
     * @param {Object} obj1 Object to merge
     * @returns {Object} Result of all merge properties
     */
    function merge(/* obj1, obj2, obj3, ... */) {
      var result = {};
      function assignValue(val, key) {
        if (typeof result[key] === 'object' && typeof val === 'object') {
          result[key] = merge(result[key], val);
        } else {
          result[key] = val;
        }
      }

      for (var i = 0, l = arguments.length; i < l; i++) {
        forEach(arguments[i], assignValue);
      }
      return result;
    }

    /**
     * Function equal to merge with the difference being that no reference
     * to original objects is kept.
     *
     * @see merge
     * @param {Object} obj1 Object to merge
     * @returns {Object} Result of all merge properties
     */
    function deepMerge(/* obj1, obj2, obj3, ... */) {
      var result = {};
      function assignValue(val, key) {
        if (typeof result[key] === 'object' && typeof val === 'object') {
          result[key] = deepMerge(result[key], val);
        } else if (typeof val === 'object') {
          result[key] = deepMerge({}, val);
        } else {
          result[key] = val;
        }
      }

      for (var i = 0, l = arguments.length; i < l; i++) {
        forEach(arguments[i], assignValue);
      }
      return result;
    }

    /**
     * Extends object a by mutably adding to it the properties of object b.
     *
     * @param {Object} a The object to be extended
     * @param {Object} b The object to copy properties from
     * @param {Object} thisArg The object to bind function to
     * @return {Object} The resulting value of object a
     */
    function extend(a, b, thisArg) {
      forEach(b, function assignValue(val, key) {
        if (thisArg && typeof val === 'function') {
          a[key] = bind(val, thisArg);
        } else {
          a[key] = val;
        }
      });
      return a;
    }

    var utils = {
      isArray: isArray,
      isArrayBuffer: isArrayBuffer,
      isBuffer: isBuffer,
      isFormData: isFormData,
      isArrayBufferView: isArrayBufferView,
      isString: isString,
      isNumber: isNumber,
      isObject: isObject,
      isUndefined: isUndefined,
      isDate: isDate,
      isFile: isFile,
      isBlob: isBlob,
      isFunction: isFunction,
      isStream: isStream,
      isURLSearchParams: isURLSearchParams,
      isStandardBrowserEnv: isStandardBrowserEnv,
      forEach: forEach,
      merge: merge,
      deepMerge: deepMerge,
      extend: extend,
      trim: trim
    };

    function encode(val) {
      return encodeURIComponent(val).
        replace(/%40/gi, '@').
        replace(/%3A/gi, ':').
        replace(/%24/g, '$').
        replace(/%2C/gi, ',').
        replace(/%20/g, '+').
        replace(/%5B/gi, '[').
        replace(/%5D/gi, ']');
    }

    /**
     * Build a URL by appending params to the end
     *
     * @param {string} url The base of the url (e.g., http://www.google.com)
     * @param {object} [params] The params to be appended
     * @returns {string} The formatted url
     */
    var buildURL = function buildURL(url, params, paramsSerializer) {
      /*eslint no-param-reassign:0*/
      if (!params) {
        return url;
      }

      var serializedParams;
      if (paramsSerializer) {
        serializedParams = paramsSerializer(params);
      } else if (utils.isURLSearchParams(params)) {
        serializedParams = params.toString();
      } else {
        var parts = [];

        utils.forEach(params, function serialize(val, key) {
          if (val === null || typeof val === 'undefined') {
            return;
          }

          if (utils.isArray(val)) {
            key = key + '[]';
          } else {
            val = [val];
          }

          utils.forEach(val, function parseValue(v) {
            if (utils.isDate(v)) {
              v = v.toISOString();
            } else if (utils.isObject(v)) {
              v = JSON.stringify(v);
            }
            parts.push(encode(key) + '=' + encode(v));
          });
        });

        serializedParams = parts.join('&');
      }

      if (serializedParams) {
        var hashmarkIndex = url.indexOf('#');
        if (hashmarkIndex !== -1) {
          url = url.slice(0, hashmarkIndex);
        }

        url += (url.indexOf('?') === -1 ? '?' : '&') + serializedParams;
      }

      return url;
    };

    function InterceptorManager() {
      this.handlers = [];
    }

    /**
     * Add a new interceptor to the stack
     *
     * @param {Function} fulfilled The function to handle `then` for a `Promise`
     * @param {Function} rejected The function to handle `reject` for a `Promise`
     *
     * @return {Number} An ID used to remove interceptor later
     */
    InterceptorManager.prototype.use = function use(fulfilled, rejected) {
      this.handlers.push({
        fulfilled: fulfilled,
        rejected: rejected
      });
      return this.handlers.length - 1;
    };

    /**
     * Remove an interceptor from the stack
     *
     * @param {Number} id The ID that was returned by `use`
     */
    InterceptorManager.prototype.eject = function eject(id) {
      if (this.handlers[id]) {
        this.handlers[id] = null;
      }
    };

    /**
     * Iterate over all the registered interceptors
     *
     * This method is particularly useful for skipping over any
     * interceptors that may have become `null` calling `eject`.
     *
     * @param {Function} fn The function to call for each interceptor
     */
    InterceptorManager.prototype.forEach = function forEach(fn) {
      utils.forEach(this.handlers, function forEachHandler(h) {
        if (h !== null) {
          fn(h);
        }
      });
    };

    var InterceptorManager_1 = InterceptorManager;

    /**
     * Transform the data for a request or a response
     *
     * @param {Object|String} data The data to be transformed
     * @param {Array} headers The headers for the request or response
     * @param {Array|Function} fns A single function or Array of functions
     * @returns {*} The resulting transformed data
     */
    var transformData = function transformData(data, headers, fns) {
      /*eslint no-param-reassign:0*/
      utils.forEach(fns, function transform(fn) {
        data = fn(data, headers);
      });

      return data;
    };

    var isCancel = function isCancel(value) {
      return !!(value && value.__CANCEL__);
    };

    var normalizeHeaderName = function normalizeHeaderName(headers, normalizedName) {
      utils.forEach(headers, function processHeader(value, name) {
        if (name !== normalizedName && name.toUpperCase() === normalizedName.toUpperCase()) {
          headers[normalizedName] = value;
          delete headers[name];
        }
      });
    };

    /**
     * Update an Error with the specified config, error code, and response.
     *
     * @param {Error} error The error to update.
     * @param {Object} config The config.
     * @param {string} [code] The error code (for example, 'ECONNABORTED').
     * @param {Object} [request] The request.
     * @param {Object} [response] The response.
     * @returns {Error} The error.
     */
    var enhanceError = function enhanceError(error, config, code, request, response) {
      error.config = config;
      if (code) {
        error.code = code;
      }

      error.request = request;
      error.response = response;
      error.isAxiosError = true;

      error.toJSON = function() {
        return {
          // Standard
          message: this.message,
          name: this.name,
          // Microsoft
          description: this.description,
          number: this.number,
          // Mozilla
          fileName: this.fileName,
          lineNumber: this.lineNumber,
          columnNumber: this.columnNumber,
          stack: this.stack,
          // Axios
          config: this.config,
          code: this.code
        };
      };
      return error;
    };

    /**
     * Create an Error with the specified message, config, error code, request and response.
     *
     * @param {string} message The error message.
     * @param {Object} config The config.
     * @param {string} [code] The error code (for example, 'ECONNABORTED').
     * @param {Object} [request] The request.
     * @param {Object} [response] The response.
     * @returns {Error} The created error.
     */
    var createError = function createError(message, config, code, request, response) {
      var error = new Error(message);
      return enhanceError(error, config, code, request, response);
    };

    /**
     * Resolve or reject a Promise based on response status.
     *
     * @param {Function} resolve A function that resolves the promise.
     * @param {Function} reject A function that rejects the promise.
     * @param {object} response The response.
     */
    var settle = function settle(resolve, reject, response) {
      var validateStatus = response.config.validateStatus;
      if (!validateStatus || validateStatus(response.status)) {
        resolve(response);
      } else {
        reject(createError(
          'Request failed with status code ' + response.status,
          response.config,
          null,
          response.request,
          response
        ));
      }
    };

    /**
     * Determines whether the specified URL is absolute
     *
     * @param {string} url The URL to test
     * @returns {boolean} True if the specified URL is absolute, otherwise false
     */
    var isAbsoluteURL = function isAbsoluteURL(url) {
      // A URL is considered absolute if it begins with "<scheme>://" or "//" (protocol-relative URL).
      // RFC 3986 defines scheme name as a sequence of characters beginning with a letter and followed
      // by any combination of letters, digits, plus, period, or hyphen.
      return /^([a-z][a-z\d\+\-\.]*:)?\/\//i.test(url);
    };

    /**
     * Creates a new URL by combining the specified URLs
     *
     * @param {string} baseURL The base URL
     * @param {string} relativeURL The relative URL
     * @returns {string} The combined URL
     */
    var combineURLs = function combineURLs(baseURL, relativeURL) {
      return relativeURL
        ? baseURL.replace(/\/+$/, '') + '/' + relativeURL.replace(/^\/+/, '')
        : baseURL;
    };

    /**
     * Creates a new URL by combining the baseURL with the requestedURL,
     * only when the requestedURL is not already an absolute URL.
     * If the requestURL is absolute, this function returns the requestedURL untouched.
     *
     * @param {string} baseURL The base URL
     * @param {string} requestedURL Absolute or relative URL to combine
     * @returns {string} The combined full path
     */
    var buildFullPath = function buildFullPath(baseURL, requestedURL) {
      if (baseURL && !isAbsoluteURL(requestedURL)) {
        return combineURLs(baseURL, requestedURL);
      }
      return requestedURL;
    };

    // Headers whose duplicates are ignored by node
    // c.f. https://nodejs.org/api/http.html#http_message_headers
    var ignoreDuplicateOf = [
      'age', 'authorization', 'content-length', 'content-type', 'etag',
      'expires', 'from', 'host', 'if-modified-since', 'if-unmodified-since',
      'last-modified', 'location', 'max-forwards', 'proxy-authorization',
      'referer', 'retry-after', 'user-agent'
    ];

    /**
     * Parse headers into an object
     *
     * ```
     * Date: Wed, 27 Aug 2014 08:58:49 GMT
     * Content-Type: application/json
     * Connection: keep-alive
     * Transfer-Encoding: chunked
     * ```
     *
     * @param {String} headers Headers needing to be parsed
     * @returns {Object} Headers parsed into an object
     */
    var parseHeaders = function parseHeaders(headers) {
      var parsed = {};
      var key;
      var val;
      var i;

      if (!headers) { return parsed; }

      utils.forEach(headers.split('\n'), function parser(line) {
        i = line.indexOf(':');
        key = utils.trim(line.substr(0, i)).toLowerCase();
        val = utils.trim(line.substr(i + 1));

        if (key) {
          if (parsed[key] && ignoreDuplicateOf.indexOf(key) >= 0) {
            return;
          }
          if (key === 'set-cookie') {
            parsed[key] = (parsed[key] ? parsed[key] : []).concat([val]);
          } else {
            parsed[key] = parsed[key] ? parsed[key] + ', ' + val : val;
          }
        }
      });

      return parsed;
    };

    var isURLSameOrigin = (
      utils.isStandardBrowserEnv() ?

      // Standard browser envs have full support of the APIs needed to test
      // whether the request URL is of the same origin as current location.
        (function standardBrowserEnv() {
          var msie = /(msie|trident)/i.test(navigator.userAgent);
          var urlParsingNode = document.createElement('a');
          var originURL;

          /**
        * Parse a URL to discover it's components
        *
        * @param {String} url The URL to be parsed
        * @returns {Object}
        */
          function resolveURL(url) {
            var href = url;

            if (msie) {
            // IE needs attribute set twice to normalize properties
              urlParsingNode.setAttribute('href', href);
              href = urlParsingNode.href;
            }

            urlParsingNode.setAttribute('href', href);

            // urlParsingNode provides the UrlUtils interface - http://url.spec.whatwg.org/#urlutils
            return {
              href: urlParsingNode.href,
              protocol: urlParsingNode.protocol ? urlParsingNode.protocol.replace(/:$/, '') : '',
              host: urlParsingNode.host,
              search: urlParsingNode.search ? urlParsingNode.search.replace(/^\?/, '') : '',
              hash: urlParsingNode.hash ? urlParsingNode.hash.replace(/^#/, '') : '',
              hostname: urlParsingNode.hostname,
              port: urlParsingNode.port,
              pathname: (urlParsingNode.pathname.charAt(0) === '/') ?
                urlParsingNode.pathname :
                '/' + urlParsingNode.pathname
            };
          }

          originURL = resolveURL(window.location.href);

          /**
        * Determine if a URL shares the same origin as the current location
        *
        * @param {String} requestURL The URL to test
        * @returns {boolean} True if URL shares the same origin, otherwise false
        */
          return function isURLSameOrigin(requestURL) {
            var parsed = (utils.isString(requestURL)) ? resolveURL(requestURL) : requestURL;
            return (parsed.protocol === originURL.protocol &&
                parsed.host === originURL.host);
          };
        })() :

      // Non standard browser envs (web workers, react-native) lack needed support.
        (function nonStandardBrowserEnv() {
          return function isURLSameOrigin() {
            return true;
          };
        })()
    );

    var cookies = (
      utils.isStandardBrowserEnv() ?

      // Standard browser envs support document.cookie
        (function standardBrowserEnv() {
          return {
            write: function write(name, value, expires, path, domain, secure) {
              var cookie = [];
              cookie.push(name + '=' + encodeURIComponent(value));

              if (utils.isNumber(expires)) {
                cookie.push('expires=' + new Date(expires).toGMTString());
              }

              if (utils.isString(path)) {
                cookie.push('path=' + path);
              }

              if (utils.isString(domain)) {
                cookie.push('domain=' + domain);
              }

              if (secure === true) {
                cookie.push('secure');
              }

              document.cookie = cookie.join('; ');
            },

            read: function read(name) {
              var match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
              return (match ? decodeURIComponent(match[3]) : null);
            },

            remove: function remove(name) {
              this.write(name, '', Date.now() - 86400000);
            }
          };
        })() :

      // Non standard browser env (web workers, react-native) lack needed support.
        (function nonStandardBrowserEnv() {
          return {
            write: function write() {},
            read: function read() { return null; },
            remove: function remove() {}
          };
        })()
    );

    var xhr = function xhrAdapter(config) {
      return new Promise(function dispatchXhrRequest(resolve, reject) {
        var requestData = config.data;
        var requestHeaders = config.headers;

        if (utils.isFormData(requestData)) {
          delete requestHeaders['Content-Type']; // Let the browser set it
        }

        var request = new XMLHttpRequest();

        // HTTP basic authentication
        if (config.auth) {
          var username = config.auth.username || '';
          var password = config.auth.password || '';
          requestHeaders.Authorization = 'Basic ' + btoa(username + ':' + password);
        }

        var fullPath = buildFullPath(config.baseURL, config.url);
        request.open(config.method.toUpperCase(), buildURL(fullPath, config.params, config.paramsSerializer), true);

        // Set the request timeout in MS
        request.timeout = config.timeout;

        // Listen for ready state
        request.onreadystatechange = function handleLoad() {
          if (!request || request.readyState !== 4) {
            return;
          }

          // The request errored out and we didn't get a response, this will be
          // handled by onerror instead
          // With one exception: request that using file: protocol, most browsers
          // will return status as 0 even though it's a successful request
          if (request.status === 0 && !(request.responseURL && request.responseURL.indexOf('file:') === 0)) {
            return;
          }

          // Prepare the response
          var responseHeaders = 'getAllResponseHeaders' in request ? parseHeaders(request.getAllResponseHeaders()) : null;
          var responseData = !config.responseType || config.responseType === 'text' ? request.responseText : request.response;
          var response = {
            data: responseData,
            status: request.status,
            statusText: request.statusText,
            headers: responseHeaders,
            config: config,
            request: request
          };

          settle(resolve, reject, response);

          // Clean up request
          request = null;
        };

        // Handle browser request cancellation (as opposed to a manual cancellation)
        request.onabort = function handleAbort() {
          if (!request) {
            return;
          }

          reject(createError('Request aborted', config, 'ECONNABORTED', request));

          // Clean up request
          request = null;
        };

        // Handle low level network errors
        request.onerror = function handleError() {
          // Real errors are hidden from us by the browser
          // onerror should only fire if it's a network error
          reject(createError('Network Error', config, null, request));

          // Clean up request
          request = null;
        };

        // Handle timeout
        request.ontimeout = function handleTimeout() {
          var timeoutErrorMessage = 'timeout of ' + config.timeout + 'ms exceeded';
          if (config.timeoutErrorMessage) {
            timeoutErrorMessage = config.timeoutErrorMessage;
          }
          reject(createError(timeoutErrorMessage, config, 'ECONNABORTED',
            request));

          // Clean up request
          request = null;
        };

        // Add xsrf header
        // This is only done if running in a standard browser environment.
        // Specifically not if we're in a web worker, or react-native.
        if (utils.isStandardBrowserEnv()) {
          var cookies$1 = cookies;

          // Add xsrf header
          var xsrfValue = (config.withCredentials || isURLSameOrigin(fullPath)) && config.xsrfCookieName ?
            cookies$1.read(config.xsrfCookieName) :
            undefined;

          if (xsrfValue) {
            requestHeaders[config.xsrfHeaderName] = xsrfValue;
          }
        }

        // Add headers to the request
        if ('setRequestHeader' in request) {
          utils.forEach(requestHeaders, function setRequestHeader(val, key) {
            if (typeof requestData === 'undefined' && key.toLowerCase() === 'content-type') {
              // Remove Content-Type if data is undefined
              delete requestHeaders[key];
            } else {
              // Otherwise add header to the request
              request.setRequestHeader(key, val);
            }
          });
        }

        // Add withCredentials to request if needed
        if (!utils.isUndefined(config.withCredentials)) {
          request.withCredentials = !!config.withCredentials;
        }

        // Add responseType to request if needed
        if (config.responseType) {
          try {
            request.responseType = config.responseType;
          } catch (e) {
            // Expected DOMException thrown by browsers not compatible XMLHttpRequest Level 2.
            // But, this can be suppressed for 'json' type as it can be parsed by default 'transformResponse' function.
            if (config.responseType !== 'json') {
              throw e;
            }
          }
        }

        // Handle progress if needed
        if (typeof config.onDownloadProgress === 'function') {
          request.addEventListener('progress', config.onDownloadProgress);
        }

        // Not all browsers support upload events
        if (typeof config.onUploadProgress === 'function' && request.upload) {
          request.upload.addEventListener('progress', config.onUploadProgress);
        }

        if (config.cancelToken) {
          // Handle cancellation
          config.cancelToken.promise.then(function onCanceled(cancel) {
            if (!request) {
              return;
            }

            request.abort();
            reject(cancel);
            // Clean up request
            request = null;
          });
        }

        if (requestData === undefined) {
          requestData = null;
        }

        // Send the request
        request.send(requestData);
      });
    };

    var DEFAULT_CONTENT_TYPE = {
      'Content-Type': 'application/x-www-form-urlencoded'
    };

    function setContentTypeIfUnset(headers, value) {
      if (!utils.isUndefined(headers) && utils.isUndefined(headers['Content-Type'])) {
        headers['Content-Type'] = value;
      }
    }

    function getDefaultAdapter() {
      var adapter;
      if (typeof XMLHttpRequest !== 'undefined') {
        // For browsers use XHR adapter
        adapter = xhr;
      } else if (typeof process !== 'undefined' && Object.prototype.toString.call(process) === '[object process]') {
        // For node use HTTP adapter
        adapter = xhr;
      }
      return adapter;
    }

    var defaults$1 = {
      adapter: getDefaultAdapter(),

      transformRequest: [function transformRequest(data, headers) {
        normalizeHeaderName(headers, 'Accept');
        normalizeHeaderName(headers, 'Content-Type');
        if (utils.isFormData(data) ||
          utils.isArrayBuffer(data) ||
          utils.isBuffer(data) ||
          utils.isStream(data) ||
          utils.isFile(data) ||
          utils.isBlob(data)
        ) {
          return data;
        }
        if (utils.isArrayBufferView(data)) {
          return data.buffer;
        }
        if (utils.isURLSearchParams(data)) {
          setContentTypeIfUnset(headers, 'application/x-www-form-urlencoded;charset=utf-8');
          return data.toString();
        }
        if (utils.isObject(data)) {
          setContentTypeIfUnset(headers, 'application/json;charset=utf-8');
          return JSON.stringify(data);
        }
        return data;
      }],

      transformResponse: [function transformResponse(data) {
        /*eslint no-param-reassign:0*/
        if (typeof data === 'string') {
          try {
            data = JSON.parse(data);
          } catch (e) { /* Ignore */ }
        }
        return data;
      }],

      /**
       * A timeout in milliseconds to abort a request. If set to 0 (default) a
       * timeout is not created.
       */
      timeout: 0,

      xsrfCookieName: 'XSRF-TOKEN',
      xsrfHeaderName: 'X-XSRF-TOKEN',

      maxContentLength: -1,

      validateStatus: function validateStatus(status) {
        return status >= 200 && status < 300;
      }
    };

    defaults$1.headers = {
      common: {
        'Accept': 'application/json, text/plain, */*'
      }
    };

    utils.forEach(['delete', 'get', 'head'], function forEachMethodNoData(method) {
      defaults$1.headers[method] = {};
    });

    utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
      defaults$1.headers[method] = utils.merge(DEFAULT_CONTENT_TYPE);
    });

    var defaults_1 = defaults$1;

    /**
     * Throws a `Cancel` if cancellation has been requested.
     */
    function throwIfCancellationRequested(config) {
      if (config.cancelToken) {
        config.cancelToken.throwIfRequested();
      }
    }

    /**
     * Dispatch a request to the server using the configured adapter.
     *
     * @param {object} config The config that is to be used for the request
     * @returns {Promise} The Promise to be fulfilled
     */
    var dispatchRequest = function dispatchRequest(config) {
      throwIfCancellationRequested(config);

      // Ensure headers exist
      config.headers = config.headers || {};

      // Transform request data
      config.data = transformData(
        config.data,
        config.headers,
        config.transformRequest
      );

      // Flatten headers
      config.headers = utils.merge(
        config.headers.common || {},
        config.headers[config.method] || {},
        config.headers
      );

      utils.forEach(
        ['delete', 'get', 'head', 'post', 'put', 'patch', 'common'],
        function cleanHeaderConfig(method) {
          delete config.headers[method];
        }
      );

      var adapter = config.adapter || defaults_1.adapter;

      return adapter(config).then(function onAdapterResolution(response) {
        throwIfCancellationRequested(config);

        // Transform response data
        response.data = transformData(
          response.data,
          response.headers,
          config.transformResponse
        );

        return response;
      }, function onAdapterRejection(reason) {
        if (!isCancel(reason)) {
          throwIfCancellationRequested(config);

          // Transform response data
          if (reason && reason.response) {
            reason.response.data = transformData(
              reason.response.data,
              reason.response.headers,
              config.transformResponse
            );
          }
        }

        return Promise.reject(reason);
      });
    };

    /**
     * Config-specific merge-function which creates a new config-object
     * by merging two configuration objects together.
     *
     * @param {Object} config1
     * @param {Object} config2
     * @returns {Object} New object resulting from merging config2 to config1
     */
    var mergeConfig = function mergeConfig(config1, config2) {
      // eslint-disable-next-line no-param-reassign
      config2 = config2 || {};
      var config = {};

      var valueFromConfig2Keys = ['url', 'method', 'params', 'data'];
      var mergeDeepPropertiesKeys = ['headers', 'auth', 'proxy'];
      var defaultToConfig2Keys = [
        'baseURL', 'url', 'transformRequest', 'transformResponse', 'paramsSerializer',
        'timeout', 'withCredentials', 'adapter', 'responseType', 'xsrfCookieName',
        'xsrfHeaderName', 'onUploadProgress', 'onDownloadProgress',
        'maxContentLength', 'validateStatus', 'maxRedirects', 'httpAgent',
        'httpsAgent', 'cancelToken', 'socketPath'
      ];

      utils.forEach(valueFromConfig2Keys, function valueFromConfig2(prop) {
        if (typeof config2[prop] !== 'undefined') {
          config[prop] = config2[prop];
        }
      });

      utils.forEach(mergeDeepPropertiesKeys, function mergeDeepProperties(prop) {
        if (utils.isObject(config2[prop])) {
          config[prop] = utils.deepMerge(config1[prop], config2[prop]);
        } else if (typeof config2[prop] !== 'undefined') {
          config[prop] = config2[prop];
        } else if (utils.isObject(config1[prop])) {
          config[prop] = utils.deepMerge(config1[prop]);
        } else if (typeof config1[prop] !== 'undefined') {
          config[prop] = config1[prop];
        }
      });

      utils.forEach(defaultToConfig2Keys, function defaultToConfig2(prop) {
        if (typeof config2[prop] !== 'undefined') {
          config[prop] = config2[prop];
        } else if (typeof config1[prop] !== 'undefined') {
          config[prop] = config1[prop];
        }
      });

      var axiosKeys = valueFromConfig2Keys
        .concat(mergeDeepPropertiesKeys)
        .concat(defaultToConfig2Keys);

      var otherKeys = Object
        .keys(config2)
        .filter(function filterAxiosKeys(key) {
          return axiosKeys.indexOf(key) === -1;
        });

      utils.forEach(otherKeys, function otherKeysDefaultToConfig2(prop) {
        if (typeof config2[prop] !== 'undefined') {
          config[prop] = config2[prop];
        } else if (typeof config1[prop] !== 'undefined') {
          config[prop] = config1[prop];
        }
      });

      return config;
    };

    /**
     * Create a new instance of Axios
     *
     * @param {Object} instanceConfig The default config for the instance
     */
    function Axios(instanceConfig) {
      this.defaults = instanceConfig;
      this.interceptors = {
        request: new InterceptorManager_1(),
        response: new InterceptorManager_1()
      };
    }

    /**
     * Dispatch a request
     *
     * @param {Object} config The config specific for this request (merged with this.defaults)
     */
    Axios.prototype.request = function request(config) {
      /*eslint no-param-reassign:0*/
      // Allow for axios('example/url'[, config]) a la fetch API
      if (typeof config === 'string') {
        config = arguments[1] || {};
        config.url = arguments[0];
      } else {
        config = config || {};
      }

      config = mergeConfig(this.defaults, config);

      // Set config.method
      if (config.method) {
        config.method = config.method.toLowerCase();
      } else if (this.defaults.method) {
        config.method = this.defaults.method.toLowerCase();
      } else {
        config.method = 'get';
      }

      // Hook up interceptors middleware
      var chain = [dispatchRequest, undefined];
      var promise = Promise.resolve(config);

      this.interceptors.request.forEach(function unshiftRequestInterceptors(interceptor) {
        chain.unshift(interceptor.fulfilled, interceptor.rejected);
      });

      this.interceptors.response.forEach(function pushResponseInterceptors(interceptor) {
        chain.push(interceptor.fulfilled, interceptor.rejected);
      });

      while (chain.length) {
        promise = promise.then(chain.shift(), chain.shift());
      }

      return promise;
    };

    Axios.prototype.getUri = function getUri(config) {
      config = mergeConfig(this.defaults, config);
      return buildURL(config.url, config.params, config.paramsSerializer).replace(/^\?/, '');
    };

    // Provide aliases for supported request methods
    utils.forEach(['delete', 'get', 'head', 'options'], function forEachMethodNoData(method) {
      /*eslint func-names:0*/
      Axios.prototype[method] = function(url, config) {
        return this.request(utils.merge(config || {}, {
          method: method,
          url: url
        }));
      };
    });

    utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
      /*eslint func-names:0*/
      Axios.prototype[method] = function(url, data, config) {
        return this.request(utils.merge(config || {}, {
          method: method,
          url: url,
          data: data
        }));
      };
    });

    var Axios_1 = Axios;

    /**
     * A `Cancel` is an object that is thrown when an operation is canceled.
     *
     * @class
     * @param {string=} message The message.
     */
    function Cancel(message) {
      this.message = message;
    }

    Cancel.prototype.toString = function toString() {
      return 'Cancel' + (this.message ? ': ' + this.message : '');
    };

    Cancel.prototype.__CANCEL__ = true;

    var Cancel_1 = Cancel;

    /**
     * A `CancelToken` is an object that can be used to request cancellation of an operation.
     *
     * @class
     * @param {Function} executor The executor function.
     */
    function CancelToken(executor) {
      if (typeof executor !== 'function') {
        throw new TypeError('executor must be a function.');
      }

      var resolvePromise;
      this.promise = new Promise(function promiseExecutor(resolve) {
        resolvePromise = resolve;
      });

      var token = this;
      executor(function cancel(message) {
        if (token.reason) {
          // Cancellation has already been requested
          return;
        }

        token.reason = new Cancel_1(message);
        resolvePromise(token.reason);
      });
    }

    /**
     * Throws a `Cancel` if cancellation has been requested.
     */
    CancelToken.prototype.throwIfRequested = function throwIfRequested() {
      if (this.reason) {
        throw this.reason;
      }
    };

    /**
     * Returns an object that contains a new `CancelToken` and a function that, when called,
     * cancels the `CancelToken`.
     */
    CancelToken.source = function source() {
      var cancel;
      var token = new CancelToken(function executor(c) {
        cancel = c;
      });
      return {
        token: token,
        cancel: cancel
      };
    };

    var CancelToken_1 = CancelToken;

    /**
     * Syntactic sugar for invoking a function and expanding an array for arguments.
     *
     * Common use case would be to use `Function.prototype.apply`.
     *
     *  ```js
     *  function f(x, y, z) {}
     *  var args = [1, 2, 3];
     *  f.apply(null, args);
     *  ```
     *
     * With `spread` this example can be re-written.
     *
     *  ```js
     *  spread(function(x, y, z) {})([1, 2, 3]);
     *  ```
     *
     * @param {Function} callback
     * @returns {Function}
     */
    var spread = function spread(callback) {
      return function wrap(arr) {
        return callback.apply(null, arr);
      };
    };

    /**
     * Create an instance of Axios
     *
     * @param {Object} defaultConfig The default config for the instance
     * @return {Axios} A new instance of Axios
     */
    function createInstance(defaultConfig) {
      var context = new Axios_1(defaultConfig);
      var instance = bind(Axios_1.prototype.request, context);

      // Copy axios.prototype to instance
      utils.extend(instance, Axios_1.prototype, context);

      // Copy context to instance
      utils.extend(instance, context);

      return instance;
    }

    // Create the default instance to be exported
    var axios = createInstance(defaults_1);

    // Expose Axios class to allow class inheritance
    axios.Axios = Axios_1;

    // Factory for creating new instances
    axios.create = function create(instanceConfig) {
      return createInstance(mergeConfig(axios.defaults, instanceConfig));
    };

    // Expose Cancel & CancelToken
    axios.Cancel = Cancel_1;
    axios.CancelToken = CancelToken_1;
    axios.isCancel = isCancel;

    // Expose all/spread
    axios.all = function all(promises) {
      return Promise.all(promises);
    };
    axios.spread = spread;

    var axios_1 = axios;

    // Allow use of default import syntax in TypeScript
    var _default = axios;
    axios_1.default = _default;

    var axios$1 = axios_1;

    // export default [

    var API_GET_BANNERS = function API_GET_BANNERS() {
      return new Promise(function (resolve, reject) {
        //Make the call 
        axios$1.get("https://photo-cms.herokuapp.com/api/imageurl/banners/james@email.com").then(function (response) {
          resolve(response.data);
        })["catch"](function (error) {
          reject(error);
        });
      });
    };

    /* src/components/home/Banner.svelte generated by Svelte v3.21.0 */

    const { console: console_1 } = globals;
    const file$3 = "src/components/home/Banner.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[4] = list[i];
    	return child_ctx;
    }

    // (100:4) {#each bannerArray as item}
    function create_each_block(ctx) {
    	let div1;
    	let div0;
    	let img;
    	let img_src_value;
    	let dispose;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			img = element("img");
    			attr_dev(div0, "class", "overlay");
    			add_location(div0, file$3, 100, 32, 5835);
    			if (img.src !== (img_src_value = /*item*/ ctx[4])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "Hi banner image from Savanna Grunzke Photography");
    			attr_dev(img, "class", "svelte-1o9tiug");
    			add_location(img, file$3, 100, 59, 5862);
    			attr_dev(div1, "class", "swiper-slide svelte-1o9tiug");
    			add_location(div1, file$3, 100, 6, 5809);
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div1, img);
    			if (remount) dispose();
    			dispose = listen_dev(img, "load", /*load_handler*/ ctx[3], false, false, false);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*bannerArray*/ 1 && img.src !== (img_src_value = /*item*/ ctx[4])) {
    				attr_dev(img, "src", img_src_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(100:4) {#each bannerArray as item}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let div5;
    	let div2;
    	let div1;
    	let div0;
    	let img;
    	let img_src_value;
    	let t0;
    	let t1;
    	let div3;
    	let t2;
    	let div4;
    	let t3;
    	let div6;
    	let h1;
    	let t5;
    	let h2;
    	let each_value = /*bannerArray*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div5 = element("div");
    			div2 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			img = element("img");
    			t0 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t1 = space();
    			div3 = element("div");
    			t2 = space();
    			div4 = element("div");
    			t3 = space();
    			div6 = element("div");
    			h1 = element("h1");
    			h1.textContent = "SRG";
    			t5 = space();
    			h2 = element("h2");
    			h2.textContent = "PHOTO & VIDEO";
    			attr_dev(div0, "class", "overlay");
    			add_location(div0, file$3, 98, 30, 5660);
    			if (img.src !== (img_src_value = /*placeholder*/ ctx[2])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "Banner image from Savanna Grunzke Photography");
    			attr_dev(img, "class", "svelte-1o9tiug");
    			add_location(img, file$3, 98, 57, 5687);
    			attr_dev(div1, "class", "swiper-slide svelte-1o9tiug");
    			add_location(div1, file$3, 98, 4, 5634);
    			attr_dev(div2, "class", "swiper-wrapper");
    			add_location(div2, file$3, 97, 4, 5601);
    			attr_dev(div3, "class", "swiper-button-next swiper-button-white svelte-1o9tiug");
    			add_location(div3, file$3, 105, 4, 6034);
    			attr_dev(div4, "class", "swiper-button-prev swiper-button-white svelte-1o9tiug");
    			add_location(div4, file$3, 106, 4, 6097);
    			attr_dev(div5, "class", "swiper-container svelte-1o9tiug");
    			add_location(div5, file$3, 96, 2, 5566);
    			attr_dev(h1, "class", "p-marker svelte-1o9tiug");
    			add_location(h1, file$3, 111, 6, 6199);
    			attr_dev(h2, "class", "vollkorn svelte-1o9tiug");
    			add_location(h2, file$3, 112, 6, 6235);
    			attr_dev(div6, "class", "caption svelte-1o9tiug");
    			add_location(div6, file$3, 110, 2, 6171);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div5, anchor);
    			append_dev(div5, div2);
    			append_dev(div2, div1);
    			append_dev(div1, div0);
    			append_dev(div1, img);
    			append_dev(div2, t0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div2, null);
    			}

    			append_dev(div5, t1);
    			append_dev(div5, div3);
    			append_dev(div5, t2);
    			append_dev(div5, div4);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, div6, anchor);
    			append_dev(div6, h1);
    			append_dev(div6, t5);
    			append_dev(div6, h2);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*bannerArray, imgDispatch*/ 3) {
    				each_value = /*bannerArray*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div2, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div5);
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(div6);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	const imgDispatch = createEventDispatcher();

    	// let bannerArray = ["https://lh3.googleusercontent.com/84iWq5agZbwF_5k8wTeY6Iu0oa7caJEw349bQJl6PZ5_cj7neAzti2Mg0tGRSZtphKXoHo72nSqQL2-nIq2aDMG3hgbUhSnSvCbbHS45tKFy4jq_qIUjf3xARyMYT5I8WPvQjRLapLc8qsN5TwWRvCFpYWuCF-5o2CHmFUv6GgtTtZoYWr6RlEBEclLruKmI2hRqlQj5jkefoqov0CvHTIflS4c-FyFuG-8ee1cVCMRqqgJHZlkn9wV2uq7Vfndaqs0OfUnbsHlhlxOy0YJUZIGrD_DZbGpuzj4TW9z4EXsMllk5pWlPd4XzrpPn0W4AQY277R5VfIA10dCAOdoE-P348h3RZJOdRiVK7EGEkfk-Bi4R4ndO1GsDIfEOUpDADadhJUEyMpkSqXnkp8RKRvmJDCp1FTxlPEHVIIdXuoP7psCLQtHUI48rbNxKGJ0ClHSSCfjQ9MFOakn9aCjkNhbuRi-2dhXVs97pBz3lVS565dlEdkudjcT7qtY3dWghtaXQHUdTJ8UyJ5PmhmZOIbyPMoXtC_mIB4FJBMwSv8NOQlncXbLjmxZIm85vVSmPC-Tv8rFeLLikkTpUSqp03pP94CgvhbtpSdSBs180XyjOyuFHs6zb24uEJylJSPOzjQjxcXWTUo-eGwitH-VUH7oiC2bJQLgs9__SbCmQ7tiNZfXF0KWZltBmo9A2zrwX8TeRMeQF6pIaAu4DYs0YX3WcWr_mg-5fLrbqJ-jM9gnlFLr7xg=w1487-h990-no", "https://lh3.googleusercontent.com/-FFCM2EBfGIc3pMKmIclyuKfRaCTGMwULXruvd34zqO2r1k1VmHilvizSChbiXz1rtOvFbOLC7a-Ded58NxhgUWPeCTntyMQErr_C55HFYd3h3PHCiv11qHV9KnJhSai7Ju7vqdvb3on3lErIRpyOS_7IRnWy_ci_tF4ZAQpZT7h61H6en414CeqUslQBcGQKheT0JdH1JXcMZKQZBzVf8qzt8FpwZiFNiYzK3_Ia5m7jwvwUB4YVuJFEenkOCcESnJQZKdMLmsqaX_36r76n_npRjltLfbQ08dkywm4YoN-RzYTdM3NrjuBvZ6RzM3qGMuZRwSr1j6QYMHWfqbc4IYwnRZfdr6g3V9S_F_0q5fN16g3UbVYaUSZf9fm3XDGOADrEWsv2t0XXoOZuhrb7iPDKuopDL0eU9LC_qDioIxzNt_B-_pIiLUuuieB4Y6ohSBU-GbrMN35V_0nhwqShb-dZ9BH7Nqpk6Xbm7LXtWsyRSaDrdCyChIUiUzehoPjk8s-dvve2p6dEayP4z7zbaS4OY1tWzLlUiyts4ZDYoNKb-2Olmz18sHdZBuMSXLmFAT3I8w2evo4LvtZZJDd6yaXrsnl-T1eqxW20ppZ8KbeBmfy3Kl6BYzzee6i3DY1aJa2njkblowVnJn2AxMWm7aUrmgKML-cP8sjY-OKMV1uuGrDkmZjEk2LgUklrH1rdRmKLyxWbNU1rmCLCzGr50LXF97o1qzQbTToUqbsTqyCggRkbQ=w1487-h990-no"]
    	let bannerArray = [];

    	let placeholder = ["images/Banner-min.jpg"];

    	onMount(async () => {
    		API_GET_BANNERS().then(response => {
    			$$invalidate(0, bannerArray = response);
    			return bannerArray;
    		}).then(response => {
    			var mySwiper = new Swiper(".swiper-container",
    			{
    					loop: true,
    					speed: 2000,
    					effect: "fade",
    					autoplay: { delay: 4000, disableOnInteraction: true },
    					navigation: {
    						nextEl: ".swiper-button-next",
    						prevEl: ".swiper-button-prev"
    					}
    				});
    		}).catch(error => {
    			console.log(error);
    		});
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<Banner> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Banner", $$slots, []);
    	const load_handler = () => imgDispatch("loaded");

    	$$self.$capture_state = () => ({
    		Swiper,
    		onMount,
    		axios: axios$1,
    		API_GET_BANNERS,
    		createEventDispatcher,
    		imgDispatch,
    		bannerArray,
    		placeholder
    	});

    	$$self.$inject_state = $$props => {
    		if ("bannerArray" in $$props) $$invalidate(0, bannerArray = $$props.bannerArray);
    		if ("placeholder" in $$props) $$invalidate(2, placeholder = $$props.placeholder);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [bannerArray, imgDispatch, placeholder, load_handler];
    }

    class Banner extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Banner",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    var sal = createCommonjsModule(function (module, exports) {
    !function(e,t){module.exports=t();}(commonjsGlobal,(function(){return function(e){var t={};function n(r){if(t[r])return t[r].exports;var o=t[r]={i:r,l:!1,exports:{}};return e[r].call(o.exports,o,o.exports,n),o.l=!0,o.exports}return n.m=e,n.c=t,n.d=function(e,t,r){n.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:r});},n.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0});},n.t=function(e,t){if(1&t&&(e=n(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var r=Object.create(null);if(n.r(r),Object.defineProperty(r,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var o in e)n.d(r,o,function(t){return e[t]}.bind(null,o));return r},n.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return n.d(t,"a",t),t},n.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},n.p="dist/",n(n.s=0)}([function(e,t,n){n.r(t);n(1);function r(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r);}return n}function o(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?r(n,!0).forEach((function(t){i(e,t,n[t]);})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):r(n).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t));}));}return e}function i(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}var a="Sal was not initialised! Probably it is used in SSR.",s="Your browser does not support IntersectionObserver!\nGet a polyfill from here:\nhttps://github.com/w3c/IntersectionObserver/tree/master/polyfill",l={rootMargin:"0% 50%",threshold:.5,animateClassName:"sal-animate",disabledClassName:"sal-disabled",enterEventName:"sal:in",exitEventName:"sal:out",selector:"[data-sal]",once:!0,disabled:!1},u=[],c=null,f=function(e,t){var n=new CustomEvent(e,{bubbles:!0,detail:t});t.target.dispatchEvent(n);},d=function(){document.body.classList.add(l.disabledClassName);},b=function(){return l.disabled||"function"==typeof l.disabled&&l.disabled()},p=function(e,t){e.forEach((function(e){e.intersectionRatio>=l.threshold?(!function(e){e.target.classList.add(l.animateClassName),f(l.enterEventName,e);}(e),l.once&&t.unobserve(e.target)):l.once||function(e){e.target.classList.remove(l.animateClassName),f(l.exitEventName,e);}(e);}));},m=function(){d(),c.disconnect(),c=null;},y=function(){document.body.classList.remove(l.disabledClassName),c=new IntersectionObserver(p,{rootMargin:l.rootMargin,threshold:l.threshold}),(u=[].filter.call(document.querySelectorAll(l.selector),(function(e){return !function(e){return e.classList.contains(l.animateClassName)}(e,l.animateClassName)}))).forEach((function(e){return c.observe(e)}));};t.default=function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:l;if(e!==l&&(l=o({},l,{},e)),"undefined"==typeof window)return console.warn(a),{elements:u,disable:m,enable:y};if(!window.IntersectionObserver)throw d(),Error(s);return b()?d():y(),{elements:u,disable:m,enable:y}};},function(e,t,n){}]).default}));

    });

    var sal$1 = unwrapExports(sal);
    var sal_1 = sal.sal;

    /* src/components/home/About.svelte generated by Svelte v3.21.0 */
    const file$4 = "src/components/home/About.svelte";

    function create_fragment$4(ctx) {
    	let div0;
    	let t0;
    	let div6;
    	let div1;
    	let img0;
    	let img0_src_value;
    	let t1;
    	let div5;
    	let div2;
    	let h2;
    	let t3;
    	let div4;
    	let p0;
    	let t5;
    	let p1;
    	let t7;
    	let p2;
    	let t9;
    	let div3;
    	let img1;
    	let img1_src_value;

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			t0 = space();
    			div6 = element("div");
    			div1 = element("div");
    			img0 = element("img");
    			t1 = space();
    			div5 = element("div");
    			div2 = element("div");
    			h2 = element("h2");
    			h2.textContent = "Behind the lens";
    			t3 = space();
    			div4 = element("div");
    			p0 = element("p");
    			p0.textContent = "Hey! I’m Savanna Rose Grunzke (SRG). I’ve loved photography and media for as long as i can remember. Movies were my first love, and they still win my heart every time, but growing up in a small town in Southern MN didn’t give me many oportunities to learn more about film, so I took up photography and tought myself!";
    			t5 = space();
    			p1 = element("p");
    			p1.textContent = "I envy the art of capturing a moment and keeping it forever. My job and passion is to help you capture your moments. For more information, go to my bio or contact me for questions.";
    			t7 = space();
    			p2 = element("p");
    			p2.textContent = "XOXO,";
    			t9 = space();
    			div3 = element("div");
    			img1 = element("img");
    			attr_dev(div0, "class", "about-nav svelte-7fs79o");
    			attr_dev(div0, "id", "about");
    			add_location(div0, file$4, 83, 0, 2012);
    			if (img0.src !== (img0_src_value = /*about*/ ctx[1])) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "Savanna Grunzke photography");
    			attr_dev(img0, "class", "svelte-7fs79o");
    			add_location(img0, file$4, 86, 8, 2120);
    			attr_dev(div1, "class", "about__photo col svelte-7fs79o");
    			add_location(div1, file$4, 85, 4, 2081);
    			attr_dev(h2, "class", "svelte-7fs79o");
    			add_location(h2, file$4, 90, 12, 2278);
    			attr_dev(div2, "class", "about__bio__header vollkorn svelte-7fs79o");
    			add_location(div2, file$4, 89, 8, 2224);
    			attr_dev(p0, "class", "svelte-7fs79o");
    			add_location(p0, file$4, 93, 12, 2381);
    			attr_dev(p1, "class", "svelte-7fs79o");
    			add_location(p1, file$4, 94, 12, 2717);
    			attr_dev(p2, "class", "svelte-7fs79o");
    			add_location(p2, file$4, 95, 12, 2917);
    			if (img1.src !== (img1_src_value = /*src*/ ctx[0])) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "Savanna Grunzke signature");
    			add_location(img1, file$4, 96, 56, 2986);
    			attr_dev(div3, "class", "about__bio__content__signature svelte-7fs79o");
    			add_location(div3, file$4, 96, 12, 2942);
    			attr_dev(div4, "class", "about__bio__content alegreya svelte-7fs79o");
    			add_location(div4, file$4, 92, 8, 2326);
    			attr_dev(div5, "class", "about__bio col svelte-7fs79o");
    			add_location(div5, file$4, 88, 4, 2187);
    			attr_dev(div6, "class", "about row svelte-7fs79o");
    			add_location(div6, file$4, 84, 0, 2053);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div6, anchor);
    			append_dev(div6, div1);
    			append_dev(div1, img0);
    			append_dev(div6, t1);
    			append_dev(div6, div5);
    			append_dev(div5, div2);
    			append_dev(div2, h2);
    			append_dev(div5, t3);
    			append_dev(div5, div4);
    			append_dev(div4, p0);
    			append_dev(div4, t5);
    			append_dev(div4, p1);
    			append_dev(div4, t7);
    			append_dev(div4, p2);
    			append_dev(div4, t9);
    			append_dev(div4, div3);
    			append_dev(div3, img1);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div6);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let src = "images/SavSig.png";
    	let about = "./images/About.jpg";

    	onMount(async () => {
    		sal$1();
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<About> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("About", $$slots, []);
    	$$self.$capture_state = () => ({ sal: sal$1, src, about, onMount });

    	$$self.$inject_state = $$props => {
    		if ("src" in $$props) $$invalidate(0, src = $$props.src);
    		if ("about" in $$props) $$invalidate(1, about = $$props.about);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [src, about];
    }

    class About extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "About",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    var API_GET_RECENT = function API_GET_RECENT() {
      return new Promise(function (resolve, reject) {
        //Make the call 
        axios$1.get("https://photo-cms.herokuapp.com/api/imageurl/recent/james@email.com").then(function (response) {
          resolve(response.data);
        })["catch"](function (error) {
          reject(error);
        });
      });
    }; // API_GET_RECENT.then(

    /* src/components/home/Recent.svelte generated by Svelte v3.21.0 */

    const { console: console_1$1 } = globals;
    const file$5 = "src/components/home/Recent.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i];
    	return child_ctx;
    }

    // (110:4) {:else}
    function create_else_block$2(ctx) {
    	let div4;
    	let div0;
    	let div1;
    	let div2;
    	let div3;

    	const block = {
    		c: function create() {
    			div4 = element("div");
    			div0 = element("div");
    			div1 = element("div");
    			div2 = element("div");
    			div3 = element("div");
    			attr_dev(div0, "class", "svelte-1ddlzcr");
    			add_location(div0, file$5, 110, 30, 2583);
    			attr_dev(div1, "class", "svelte-1ddlzcr");
    			add_location(div1, file$5, 110, 41, 2594);
    			attr_dev(div2, "class", "svelte-1ddlzcr");
    			add_location(div2, file$5, 110, 52, 2605);
    			attr_dev(div3, "class", "svelte-1ddlzcr");
    			add_location(div3, file$5, 110, 63, 2616);
    			attr_dev(div4, "class", "lds-ring svelte-1ddlzcr");
    			add_location(div4, file$5, 110, 8, 2561);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div4, anchor);
    			append_dev(div4, div0);
    			append_dev(div4, div1);
    			append_dev(div4, div2);
    			append_dev(div4, div3);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div4);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$2.name,
    		type: "else",
    		source: "(110:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (106:4) {#if recentArray.length > 0}
    function create_if_block$3(ctx) {
    	let each_1_anchor;
    	let each_value = /*recentArray*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*recentArray*/ 1) {
    				each_value = /*recentArray*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(106:4) {#if recentArray.length > 0}",
    		ctx
    	});

    	return block;
    }

    // (107:8) {#each recentArray as item}
    function create_each_block$1(ctx) {
    	let div;
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			div = element("div");
    			img = element("img");
    			if (img.src !== (img_src_value = /*item*/ ctx[1])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "SG recent photos");
    			attr_dev(img, "class", "svelte-1ddlzcr");
    			add_location(img, file$5, 107, 47, 2475);
    			attr_dev(div, "class", "recent__photos__photo svelte-1ddlzcr");
    			add_location(div, file$5, 107, 12, 2440);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, img);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*recentArray*/ 1 && img.src !== (img_src_value = /*item*/ ctx[1])) {
    				attr_dev(img, "src", img_src_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(107:8) {#each recentArray as item}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let div2;
    	let div0;
    	let h2;
    	let t1;
    	let div1;

    	function select_block_type(ctx, dirty) {
    		if (/*recentArray*/ ctx[0].length > 0) return create_if_block$3;
    		return create_else_block$2;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			h2 = element("h2");
    			h2.textContent = "Most Recent";
    			t1 = space();
    			div1 = element("div");
    			if_block.c();
    			attr_dev(h2, "class", "vollkorn sg-green svelte-1ddlzcr");
    			add_location(h2, file$5, 103, 32, 2232);
    			attr_dev(div0, "class", "recent__header svelte-1ddlzcr");
    			add_location(div0, file$5, 103, 4, 2204);
    			attr_dev(div1, "data-sal", "fade");
    			attr_dev(div1, "data-sal-duration", "1000");
    			attr_dev(div1, "class", "recent__photos svelte-1ddlzcr");
    			add_location(div1, file$5, 104, 4, 2289);
    			attr_dev(div2, "class", "recent svelte-1ddlzcr");
    			add_location(div2, file$5, 102, 0, 2179);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div0, h2);
    			append_dev(div2, t1);
    			append_dev(div2, div1);
    			if_block.m(div1, null);
    		},
    		p: function update(ctx, [dirty]) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(div1, null);
    				}
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let recentArray = [];

    	onMount(async () => {
    		sal$1({ threshold: 0.2 });

    		API_GET_RECENT().then(response => {
    			$$invalidate(0, recentArray = response);
    			return recentArray;
    		}).catch(error => {
    			console.log(error);
    		});
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$1.warn(`<Recent> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Recent", $$slots, []);

    	$$self.$capture_state = () => ({
    		sal: sal$1,
    		axios: axios$1,
    		onMount,
    		API_GET_RECENT,
    		recentArray
    	});

    	$$self.$inject_state = $$props => {
    		if ("recentArray" in $$props) $$invalidate(0, recentArray = $$props.recentArray);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [recentArray];
    }

    class Recent extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Recent",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    /* src/components/home/Footer.svelte generated by Svelte v3.21.0 */

    const file$6 = "src/components/home/Footer.svelte";

    function create_fragment$6(ctx) {
    	let div3;
    	let div0;
    	let t0;
    	let div2;
    	let a0;
    	let i0;
    	let t1;
    	let div1;
    	let img;
    	let img_src_value;
    	let t2;
    	let a1;
    	let i1;

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			div0 = element("div");
    			t0 = space();
    			div2 = element("div");
    			a0 = element("a");
    			i0 = element("i");
    			t1 = space();
    			div1 = element("div");
    			img = element("img");
    			t2 = space();
    			a1 = element("a");
    			i1 = element("i");
    			attr_dev(div0, "class", "footer__divider row svelte-jz4ta8");
    			add_location(div0, file$6, 39, 4, 845);
    			attr_dev(i0, "class", "fab fa-facebook-f svelte-jz4ta8");
    			add_location(i0, file$6, 41, 76, 997);
    			attr_dev(a0, "href", "https://www.facebook.com/srg.photo.video/");
    			attr_dev(a0, "target", "_blank");
    			add_location(a0, file$6, 41, 8, 929);
    			if (img.src !== (img_src_value = /*src*/ ctx[0])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "class", "svelte-jz4ta8");
    			add_location(img, file$6, 42, 25, 1060);
    			attr_dev(div1, "class", "img svelte-jz4ta8");
    			add_location(div1, file$6, 42, 8, 1043);
    			attr_dev(i1, "class", "fab fa-instagram svelte-jz4ta8");
    			add_location(i1, file$6, 43, 71, 1149);
    			attr_dev(a1, "href", "https://www.instagram.com/srgrunzke/");
    			attr_dev(a1, "target", "_blank");
    			add_location(a1, file$6, 43, 8, 1086);
    			attr_dev(div2, "class", "footer__icons row svelte-jz4ta8");
    			add_location(div2, file$6, 40, 4, 889);
    			attr_dev(div3, "class", "footer svelte-jz4ta8");
    			add_location(div3, file$6, 38, 0, 820);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div0);
    			append_dev(div3, t0);
    			append_dev(div3, div2);
    			append_dev(div2, a0);
    			append_dev(a0, i0);
    			append_dev(div2, t1);
    			append_dev(div2, div1);
    			append_dev(div1, img);
    			append_dev(div2, t2);
    			append_dev(div2, a1);
    			append_dev(a1, i1);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let src = "./images/SavLogo.jpg";
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Footer> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Footer", $$slots, []);
    	$$self.$capture_state = () => ({ src });

    	$$self.$inject_state = $$props => {
    		if ("src" in $$props) $$invalidate(0, src = $$props.src);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [src];
    }

    class Footer extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Footer",
    			options,
    			id: create_fragment$6.name
    		});
    	}
    }

    /* src/components/home/Home.svelte generated by Svelte v3.21.0 */
    const file$7 = "src/components/home/Home.svelte";

    function create_fragment$7(ctx) {
    	let div;
    	let t0;
    	let t1;
    	let t2;
    	let current;
    	const banner = new Banner({ $$inline: true });
    	banner.$on("loaded", /*loaded_handler*/ ctx[1]);
    	const about = new About({ $$inline: true });
    	const recent = new Recent({ $$inline: true });
    	const footer = new Footer({ $$inline: true });

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(banner.$$.fragment);
    			t0 = space();
    			create_component(about.$$.fragment);
    			t1 = space();
    			create_component(recent.$$.fragment);
    			t2 = space();
    			create_component(footer.$$.fragment);
    			attr_dev(div, "class", "sg-home svelte-xcxjbs");
    			add_location(div, file$7, 15, 0, 274);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(banner, div, null);
    			append_dev(div, t0);
    			mount_component(about, div, null);
    			append_dev(div, t1);
    			mount_component(recent, div, null);
    			append_dev(div, t2);
    			mount_component(footer, div, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(banner.$$.fragment, local);
    			transition_in(about.$$.fragment, local);
    			transition_in(recent.$$.fragment, local);
    			transition_in(footer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(banner.$$.fragment, local);
    			transition_out(about.$$.fragment, local);
    			transition_out(recent.$$.fragment, local);
    			transition_out(footer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(banner);
    			destroy_component(about);
    			destroy_component(recent);
    			destroy_component(footer);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let imgLoaded = false;
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Home> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Home", $$slots, []);
    	const loaded_handler = () => $$invalidate(0, imgLoaded = true);
    	$$self.$capture_state = () => ({ Banner, About, Recent, Footer, imgLoaded });

    	$$self.$inject_state = $$props => {
    		if ("imgLoaded" in $$props) $$invalidate(0, imgLoaded = $$props.imgLoaded);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [imgLoaded, loaded_handler];
    }

    class Home extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Home",
    			options,
    			id: create_fragment$7.name
    		});
    	}
    }

    /* src/components/base/PageBanner.svelte generated by Svelte v3.21.0 */
    const file$8 = "src/components/base/PageBanner.svelte";

    function create_fragment$8(ctx) {
    	let div2;
    	let img_1;
    	let img_1_src_value;
    	let t0;
    	let div0;
    	let t1;
    	let div1;
    	let current;
    	let dispose;
    	const default_slot_template = /*$$slots*/ ctx[3].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[2], null);

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			img_1 = element("img");
    			t0 = space();
    			div0 = element("div");
    			t1 = space();
    			div1 = element("div");
    			if (default_slot) default_slot.c();
    			if (img_1.src !== (img_1_src_value = /*img*/ ctx[0])) attr_dev(img_1, "src", img_1_src_value);
    			attr_dev(img_1, "class", "svelte-11qdtrb");
    			add_location(img_1, file$8, 32, 4, 724);
    			attr_dev(div0, "class", "overlay");
    			add_location(div0, file$8, 33, 4, 786);
    			attr_dev(div1, "class", "page-banner__header p-marker svelte-11qdtrb");
    			add_location(div1, file$8, 34, 4, 818);
    			attr_dev(div2, "class", "page-banner svelte-11qdtrb");
    			add_location(div2, file$8, 31, 0, 694);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, img_1);
    			append_dev(div2, t0);
    			append_dev(div2, div0);
    			append_dev(div2, t1);
    			append_dev(div2, div1);

    			if (default_slot) {
    				default_slot.m(div1, null);
    			}

    			current = true;
    			if (remount) dispose();
    			dispose = listen_dev(img_1, "load", /*load_handler*/ ctx[4], false, false, false);
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*img*/ 1 && img_1.src !== (img_1_src_value = /*img*/ ctx[0])) {
    				attr_dev(img_1, "src", img_1_src_value);
    			}

    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 4) {
    					default_slot.p(get_slot_context(default_slot_template, ctx, /*$$scope*/ ctx[2], null), get_slot_changes(default_slot_template, /*$$scope*/ ctx[2], dirty, null));
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			if (default_slot) default_slot.d(detaching);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let { img } = $$props;
    	const imgDispatch = createEventDispatcher();
    	const writable_props = ["img"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<PageBanner> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("PageBanner", $$slots, ['default']);
    	const load_handler = () => imgDispatch("loaded");

    	$$self.$set = $$props => {
    		if ("img" in $$props) $$invalidate(0, img = $$props.img);
    		if ("$$scope" in $$props) $$invalidate(2, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({ img, createEventDispatcher, imgDispatch });

    	$$self.$inject_state = $$props => {
    		if ("img" in $$props) $$invalidate(0, img = $$props.img);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [img, imgDispatch, $$scope, $$slots, load_handler];
    }

    class PageBanner extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, { img: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "PageBanner",
    			options,
    			id: create_fragment$8.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*img*/ ctx[0] === undefined && !("img" in props)) {
    			console.warn("<PageBanner> was created without expected prop 'img'");
    		}
    	}

    	get img() {
    		throw new Error("<PageBanner>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set img(value) {
    		throw new Error("<PageBanner>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/bio/BioAboutMe.svelte generated by Svelte v3.21.0 */

    const file$9 = "src/components/bio/BioAboutMe.svelte";

    function create_fragment$9(ctx) {
    	let div2;
    	let div0;
    	let h1;
    	let t1;
    	let p0;
    	let t3;
    	let p1;
    	let t5;
    	let p2;
    	let t7;
    	let p3;
    	let t9;
    	let div1;
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			h1 = element("h1");
    			h1.textContent = "About Me";
    			t1 = space();
    			p0 = element("p");
    			p0.textContent = "Hey, you! Glad to have you here. As we may be working together soon, which I hope we will, I’d like for you to know a little more about me. I grew up in Waseca, MN and currently go to school at the University of Wisconsin-Eau Claire studying environmental geography and economics. I’m all for preserving the environment and Earth’s precious resources. I am also a member of the Minnesota Army National Guard which keeps me rather busy and active. I have a large expanse of interests, and when i say large, I mean LARGE. I involve myself in anything from baking to woodworking and I especially enjoy traveling!";
    			t3 = space();
    			p1 = element("p");
    			p1.textContent = "I have a very strong connection to nature, and I’m always inspired by its beauty. I love spending time outdoors, absorbing as much sunlight as I can. I am often described as adventurous, creative, and ambitious. My strongest belief is that you can make anything happen if you really put your mind and soul into it.";
    			t5 = space();
    			p2 = element("p");
    			p2.textContent = "YOU CAN CREATE THE LIFE YOU WANT.";
    			t7 = space();
    			p3 = element("p");
    			p3.textContent = "So that’s what I’m doing. Capturing and creating life’s most precious moments is what I beleive to be my current purpose. Allow me to accompany you in preserving these moments.";
    			t9 = space();
    			div1 = element("div");
    			img = element("img");
    			attr_dev(h1, "class", "vollkorn svelte-14tk2bm");
    			add_location(h1, file$9, 39, 8, 879);
    			attr_dev(p0, "class", "svelte-14tk2bm");
    			add_location(p0, file$9, 40, 8, 922);
    			attr_dev(p1, "class", "svelte-14tk2bm");
    			add_location(p1, file$9, 41, 8, 1547);
    			attr_dev(p2, "class", "svelte-14tk2bm");
    			add_location(p2, file$9, 42, 8, 1877);
    			attr_dev(p3, "class", "svelte-14tk2bm");
    			add_location(p3, file$9, 43, 8, 1926);
    			attr_dev(div0, "class", "bio-content__text sg-green alegreya svelte-14tk2bm");
    			add_location(div0, file$9, 38, 4, 821);
    			if (img.src !== (img_src_value = /*src*/ ctx[0])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "Savanna Grunzke");
    			attr_dev(img, "class", "svelte-14tk2bm");
    			add_location(img, file$9, 46, 8, 2164);
    			attr_dev(div1, "class", "bio-content__img svelte-14tk2bm");
    			add_location(div1, file$9, 45, 4, 2125);
    			attr_dev(div2, "class", "bio-content");
    			add_location(div2, file$9, 37, 0, 791);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div0, h1);
    			append_dev(div0, t1);
    			append_dev(div0, p0);
    			append_dev(div0, t3);
    			append_dev(div0, p1);
    			append_dev(div0, t5);
    			append_dev(div0, p2);
    			append_dev(div0, t7);
    			append_dev(div0, p3);
    			append_dev(div2, t9);
    			append_dev(div2, div1);
    			append_dev(div1, img);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let src = "images/Bio-Sav.jpg";
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<BioAboutMe> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("BioAboutMe", $$slots, []);
    	$$self.$capture_state = () => ({ src });

    	$$self.$inject_state = $$props => {
    		if ("src" in $$props) $$invalidate(0, src = $$props.src);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [src];
    }

    class BioAboutMe extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "BioAboutMe",
    			options,
    			id: create_fragment$9.name
    		});
    	}
    }

    /* src/components/bio/Bio.svelte generated by Svelte v3.21.0 */
    const file$a = "src/components/bio/Bio.svelte";

    // (9:0) <PageBanner on:loaded='{() => showPage = true}' img={url}>
    function create_default_slot(ctx) {
    	let h1;

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			h1.textContent = "Savanna Grunzke";
    			add_location(h1, file$a, 9, 4, 314);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(9:0) <PageBanner on:loaded='{() => showPage = true}' img={url}>",
    		ctx
    	});

    	return block;
    }

    // (12:0) {#if showPage}
    function create_if_block$4(ctx) {
    	let t;
    	let current;
    	const bioaboutme = new BioAboutMe({ $$inline: true });
    	const footer = new Footer({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(bioaboutme.$$.fragment);
    			t = space();
    			create_component(footer.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(bioaboutme, target, anchor);
    			insert_dev(target, t, anchor);
    			mount_component(footer, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(bioaboutme.$$.fragment, local);
    			transition_in(footer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(bioaboutme.$$.fragment, local);
    			transition_out(footer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(bioaboutme, detaching);
    			if (detaching) detach_dev(t);
    			destroy_component(footer, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$4.name,
    		type: "if",
    		source: "(12:0) {#if showPage}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$a(ctx) {
    	let t;
    	let if_block_anchor;
    	let current;

    	const pagebanner = new PageBanner({
    			props: {
    				img: url,
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	pagebanner.$on("loaded", /*loaded_handler*/ ctx[1]);
    	let if_block = /*showPage*/ ctx[0] && create_if_block$4(ctx);

    	const block = {
    		c: function create() {
    			create_component(pagebanner.$$.fragment);
    			t = space();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(pagebanner, target, anchor);
    			insert_dev(target, t, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const pagebanner_changes = {};

    			if (dirty & /*$$scope*/ 4) {
    				pagebanner_changes.$$scope = { dirty, ctx };
    			}

    			pagebanner.$set(pagebanner_changes);

    			if (/*showPage*/ ctx[0]) {
    				if (if_block) {
    					if (dirty & /*showPage*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$4(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(pagebanner.$$.fragment, local);
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(pagebanner.$$.fragment, local);
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(pagebanner, detaching);
    			if (detaching) detach_dev(t);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const url = "./images/Bio-Banner-min.jpg";

    function instance$a($$self, $$props, $$invalidate) {
    	let showPage = false;
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Bio> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Bio", $$slots, []);
    	const loaded_handler = () => $$invalidate(0, showPage = true);

    	$$self.$capture_state = () => ({
    		PageBanner,
    		BioAboutMe,
    		Footer,
    		url,
    		showPage
    	});

    	$$self.$inject_state = $$props => {
    		if ("showPage" in $$props) $$invalidate(0, showPage = $$props.showPage);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [showPage, loaded_handler];
    }

    class Bio extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Bio",
    			options,
    			id: create_fragment$a.name
    		});
    	}
    }

    // export default [

    var API_GET_PORTRAITS = function API_GET_PORTRAITS() {
      return new Promise(function (resolve, reject) {
        //Make the call 
        axios$1.get("https://photo-cms.herokuapp.com/api/imageurl/portrait/james@email.com").then(function (response) {
          resolve(response.data);
        })["catch"](function (error) {
          reject(error);
        });
      });
    };

    // export default [

    var API_GET_FAMILY = function API_GET_FAMILY() {
      return new Promise(function (resolve, reject) {
        //Make the call 
        axios$1.get("https://photo-cms.herokuapp.com/api/imageurl/family/james@email.com").then(function (response) {
          resolve(response.data);
        })["catch"](function (error) {
          reject(error);
        });
      });
    };

    // export default [

    var API_GET_EVENTS = function API_GET_EVENTS() {
      return new Promise(function (resolve, reject) {
        //Make the call 
        axios$1.get("https://photo-cms.herokuapp.com/api/imageurl/events/james@email.com").then(function (response) {
          resolve(response.data);
        })["catch"](function (error) {
          reject(error);
        });
      });
    };

    // export default [

    var API_GET_MISC = function API_GET_MISC() {
      return new Promise(function (resolve, reject) {
        //Make the call 
        axios$1.get("https://photo-cms.herokuapp.com/api/imageurl/misc/james@email.com").then(function (response) {
          resolve(response.data);
        })["catch"](function (error) {
          reject(error);
        });
      });
    };

    function cubicOut(t) {
        const f = t - 1.0;
        return f * f * f + 1.0;
    }

    function fade(node, { delay = 0, duration = 400, easing = identity }) {
        const o = +getComputedStyle(node).opacity;
        return {
            delay,
            duration,
            easing,
            css: t => `opacity: ${t * o}`
        };
    }
    function fly(node, { delay = 0, duration = 400, easing = cubicOut, x = 0, y = 0, opacity = 0 }) {
        const style = getComputedStyle(node);
        const target_opacity = +style.opacity;
        const transform = style.transform === 'none' ? '' : style.transform;
        const od = target_opacity * (1 - opacity);
        return {
            delay,
            duration,
            easing,
            css: (t, u) => `
			transform: ${transform} translate(${(1 - t) * x}px, ${(1 - t) * y}px);
			opacity: ${target_opacity - (od * u)}`
        };
    }

    var evEmitter = createCommonjsModule(function (module) {
    /**
     * EvEmitter v1.1.0
     * Lil' event emitter
     * MIT License
     */

    /* jshint unused: true, undef: true, strict: true */

    ( function( global, factory ) {
      // universal module definition
      /* jshint strict: false */ /* globals define, module, window */
      if (  module.exports ) {
        // CommonJS - Browserify, Webpack
        module.exports = factory();
      } else {
        // Browser globals
        global.EvEmitter = factory();
      }

    }( typeof window != 'undefined' ? window : commonjsGlobal, function() {

    function EvEmitter() {}

    var proto = EvEmitter.prototype;

    proto.on = function( eventName, listener ) {
      if ( !eventName || !listener ) {
        return;
      }
      // set events hash
      var events = this._events = this._events || {};
      // set listeners array
      var listeners = events[ eventName ] = events[ eventName ] || [];
      // only add once
      if ( listeners.indexOf( listener ) == -1 ) {
        listeners.push( listener );
      }

      return this;
    };

    proto.once = function( eventName, listener ) {
      if ( !eventName || !listener ) {
        return;
      }
      // add event
      this.on( eventName, listener );
      // set once flag
      // set onceEvents hash
      var onceEvents = this._onceEvents = this._onceEvents || {};
      // set onceListeners object
      var onceListeners = onceEvents[ eventName ] = onceEvents[ eventName ] || {};
      // set flag
      onceListeners[ listener ] = true;

      return this;
    };

    proto.off = function( eventName, listener ) {
      var listeners = this._events && this._events[ eventName ];
      if ( !listeners || !listeners.length ) {
        return;
      }
      var index = listeners.indexOf( listener );
      if ( index != -1 ) {
        listeners.splice( index, 1 );
      }

      return this;
    };

    proto.emitEvent = function( eventName, args ) {
      var listeners = this._events && this._events[ eventName ];
      if ( !listeners || !listeners.length ) {
        return;
      }
      // copy over to avoid interference if .off() in listener
      listeners = listeners.slice(0);
      args = args || [];
      // once stuff
      var onceListeners = this._onceEvents && this._onceEvents[ eventName ];

      for ( var i=0; i < listeners.length; i++ ) {
        var listener = listeners[i];
        var isOnce = onceListeners && onceListeners[ listener ];
        if ( isOnce ) {
          // remove listener
          // remove before trigger to prevent recursion
          this.off( eventName, listener );
          // unset once flag
          delete onceListeners[ listener ];
        }
        // trigger listener
        listener.apply( this, args );
      }

      return this;
    };

    proto.allOff = function() {
      delete this._events;
      delete this._onceEvents;
    };

    return EvEmitter;

    }));
    });

    var getSize = createCommonjsModule(function (module) {
    /*!
     * getSize v2.0.3
     * measure size of elements
     * MIT license
     */

    /* jshint browser: true, strict: true, undef: true, unused: true */
    /* globals console: false */

    ( function( window, factory ) {
      /* jshint strict: false */ /* globals define, module */
      if (  module.exports ) {
        // CommonJS
        module.exports = factory();
      } else {
        // browser global
        window.getSize = factory();
      }

    })( window, function factory() {

    // -------------------------- helpers -------------------------- //

    // get a number from a string, not a percentage
    function getStyleSize( value ) {
      var num = parseFloat( value );
      // not a percent like '100%', and a number
      var isValid = value.indexOf('%') == -1 && !isNaN( num );
      return isValid && num;
    }

    function noop() {}

    var logError = typeof console == 'undefined' ? noop :
      function( message ) {
        console.error( message );
      };

    // -------------------------- measurements -------------------------- //

    var measurements = [
      'paddingLeft',
      'paddingRight',
      'paddingTop',
      'paddingBottom',
      'marginLeft',
      'marginRight',
      'marginTop',
      'marginBottom',
      'borderLeftWidth',
      'borderRightWidth',
      'borderTopWidth',
      'borderBottomWidth'
    ];

    var measurementsLength = measurements.length;

    function getZeroSize() {
      var size = {
        width: 0,
        height: 0,
        innerWidth: 0,
        innerHeight: 0,
        outerWidth: 0,
        outerHeight: 0
      };
      for ( var i=0; i < measurementsLength; i++ ) {
        var measurement = measurements[i];
        size[ measurement ] = 0;
      }
      return size;
    }

    // -------------------------- getStyle -------------------------- //

    /**
     * getStyle, get style of element, check for Firefox bug
     * https://bugzilla.mozilla.org/show_bug.cgi?id=548397
     */
    function getStyle( elem ) {
      var style = getComputedStyle( elem );
      if ( !style ) {
        logError( 'Style returned ' + style +
          '. Are you running this code in a hidden iframe on Firefox? ' +
          'See https://bit.ly/getsizebug1' );
      }
      return style;
    }

    // -------------------------- setup -------------------------- //

    var isSetup = false;

    var isBoxSizeOuter;

    /**
     * setup
     * check isBoxSizerOuter
     * do on first getSize() rather than on page load for Firefox bug
     */
    function setup() {
      // setup once
      if ( isSetup ) {
        return;
      }
      isSetup = true;

      // -------------------------- box sizing -------------------------- //

      /**
       * Chrome & Safari measure the outer-width on style.width on border-box elems
       * IE11 & Firefox<29 measures the inner-width
       */
      var div = document.createElement('div');
      div.style.width = '200px';
      div.style.padding = '1px 2px 3px 4px';
      div.style.borderStyle = 'solid';
      div.style.borderWidth = '1px 2px 3px 4px';
      div.style.boxSizing = 'border-box';

      var body = document.body || document.documentElement;
      body.appendChild( div );
      var style = getStyle( div );
      // round value for browser zoom. desandro/masonry#928
      isBoxSizeOuter = Math.round( getStyleSize( style.width ) ) == 200;
      getSize.isBoxSizeOuter = isBoxSizeOuter;

      body.removeChild( div );
    }

    // -------------------------- getSize -------------------------- //

    function getSize( elem ) {
      setup();

      // use querySeletor if elem is string
      if ( typeof elem == 'string' ) {
        elem = document.querySelector( elem );
      }

      // do not proceed on non-objects
      if ( !elem || typeof elem != 'object' || !elem.nodeType ) {
        return;
      }

      var style = getStyle( elem );

      // if hidden, everything is 0
      if ( style.display == 'none' ) {
        return getZeroSize();
      }

      var size = {};
      size.width = elem.offsetWidth;
      size.height = elem.offsetHeight;

      var isBorderBox = size.isBorderBox = style.boxSizing == 'border-box';

      // get all measurements
      for ( var i=0; i < measurementsLength; i++ ) {
        var measurement = measurements[i];
        var value = style[ measurement ];
        var num = parseFloat( value );
        // any 'auto', 'medium' value will be 0
        size[ measurement ] = !isNaN( num ) ? num : 0;
      }

      var paddingWidth = size.paddingLeft + size.paddingRight;
      var paddingHeight = size.paddingTop + size.paddingBottom;
      var marginWidth = size.marginLeft + size.marginRight;
      var marginHeight = size.marginTop + size.marginBottom;
      var borderWidth = size.borderLeftWidth + size.borderRightWidth;
      var borderHeight = size.borderTopWidth + size.borderBottomWidth;

      var isBorderBoxSizeOuter = isBorderBox && isBoxSizeOuter;

      // overwrite width and height if we can get it from style
      var styleWidth = getStyleSize( style.width );
      if ( styleWidth !== false ) {
        size.width = styleWidth +
          // add padding and border unless it's already including it
          ( isBorderBoxSizeOuter ? 0 : paddingWidth + borderWidth );
      }

      var styleHeight = getStyleSize( style.height );
      if ( styleHeight !== false ) {
        size.height = styleHeight +
          // add padding and border unless it's already including it
          ( isBorderBoxSizeOuter ? 0 : paddingHeight + borderHeight );
      }

      size.innerWidth = size.width - ( paddingWidth + borderWidth );
      size.innerHeight = size.height - ( paddingHeight + borderHeight );

      size.outerWidth = size.width + marginWidth;
      size.outerHeight = size.height + marginHeight;

      return size;
    }

    return getSize;

    });
    });

    var matchesSelector = createCommonjsModule(function (module) {
    /**
     * matchesSelector v2.0.2
     * matchesSelector( element, '.selector' )
     * MIT license
     */

    /*jshint browser: true, strict: true, undef: true, unused: true */

    ( function( window, factory ) {
      // universal module definition
      if (  module.exports ) {
        // CommonJS
        module.exports = factory();
      } else {
        // browser global
        window.matchesSelector = factory();
      }

    }( window, function factory() {

      var matchesMethod = ( function() {
        var ElemProto = window.Element.prototype;
        // check for the standard method name first
        if ( ElemProto.matches ) {
          return 'matches';
        }
        // check un-prefixed
        if ( ElemProto.matchesSelector ) {
          return 'matchesSelector';
        }
        // check vendor prefixes
        var prefixes = [ 'webkit', 'moz', 'ms', 'o' ];

        for ( var i=0; i < prefixes.length; i++ ) {
          var prefix = prefixes[i];
          var method = prefix + 'MatchesSelector';
          if ( ElemProto[ method ] ) {
            return method;
          }
        }
      })();

      return function matchesSelector( elem, selector ) {
        return elem[ matchesMethod ]( selector );
      };

    }));
    });

    var utils$1 = createCommonjsModule(function (module) {
    /**
     * Fizzy UI utils v2.0.7
     * MIT license
     */

    /*jshint browser: true, undef: true, unused: true, strict: true */

    ( function( window, factory ) {
      // universal module definition
      /*jshint strict: false */ /*globals define, module, require */

      if (  module.exports ) {
        // CommonJS
        module.exports = factory(
          window,
          matchesSelector
        );
      } else {
        // browser global
        window.fizzyUIUtils = factory(
          window,
          window.matchesSelector
        );
      }

    }( window, function factory( window, matchesSelector ) {

    var utils = {};

    // ----- extend ----- //

    // extends objects
    utils.extend = function( a, b ) {
      for ( var prop in b ) {
        a[ prop ] = b[ prop ];
      }
      return a;
    };

    // ----- modulo ----- //

    utils.modulo = function( num, div ) {
      return ( ( num % div ) + div ) % div;
    };

    // ----- makeArray ----- //

    var arraySlice = Array.prototype.slice;

    // turn element or nodeList into an array
    utils.makeArray = function( obj ) {
      if ( Array.isArray( obj ) ) {
        // use object if already an array
        return obj;
      }
      // return empty array if undefined or null. #6
      if ( obj === null || obj === undefined ) {
        return [];
      }

      var isArrayLike = typeof obj == 'object' && typeof obj.length == 'number';
      if ( isArrayLike ) {
        // convert nodeList to array
        return arraySlice.call( obj );
      }

      // array of single index
      return [ obj ];
    };

    // ----- removeFrom ----- //

    utils.removeFrom = function( ary, obj ) {
      var index = ary.indexOf( obj );
      if ( index != -1 ) {
        ary.splice( index, 1 );
      }
    };

    // ----- getParent ----- //

    utils.getParent = function( elem, selector ) {
      while ( elem.parentNode && elem != document.body ) {
        elem = elem.parentNode;
        if ( matchesSelector( elem, selector ) ) {
          return elem;
        }
      }
    };

    // ----- getQueryElement ----- //

    // use element as selector string
    utils.getQueryElement = function( elem ) {
      if ( typeof elem == 'string' ) {
        return document.querySelector( elem );
      }
      return elem;
    };

    // ----- handleEvent ----- //

    // enable .ontype to trigger from .addEventListener( elem, 'type' )
    utils.handleEvent = function( event ) {
      var method = 'on' + event.type;
      if ( this[ method ] ) {
        this[ method ]( event );
      }
    };

    // ----- filterFindElements ----- //

    utils.filterFindElements = function( elems, selector ) {
      // make array of elems
      elems = utils.makeArray( elems );
      var ffElems = [];

      elems.forEach( function( elem ) {
        // check that elem is an actual element
        if ( !( elem instanceof HTMLElement ) ) {
          return;
        }
        // add elem if no selector
        if ( !selector ) {
          ffElems.push( elem );
          return;
        }
        // filter & find items if we have a selector
        // filter
        if ( matchesSelector( elem, selector ) ) {
          ffElems.push( elem );
        }
        // find children
        var childElems = elem.querySelectorAll( selector );
        // concat childElems to filterFound array
        for ( var i=0; i < childElems.length; i++ ) {
          ffElems.push( childElems[i] );
        }
      });

      return ffElems;
    };

    // ----- debounceMethod ----- //

    utils.debounceMethod = function( _class, methodName, threshold ) {
      threshold = threshold || 100;
      // original method
      var method = _class.prototype[ methodName ];
      var timeoutName = methodName + 'Timeout';

      _class.prototype[ methodName ] = function() {
        var timeout = this[ timeoutName ];
        clearTimeout( timeout );

        var args = arguments;
        var _this = this;
        this[ timeoutName ] = setTimeout( function() {
          method.apply( _this, args );
          delete _this[ timeoutName ];
        }, threshold );
      };
    };

    // ----- docReady ----- //

    utils.docReady = function( callback ) {
      var readyState = document.readyState;
      if ( readyState == 'complete' || readyState == 'interactive' ) {
        // do async to allow for other scripts to run. metafizzy/flickity#441
        setTimeout( callback );
      } else {
        document.addEventListener( 'DOMContentLoaded', callback );
      }
    };

    // ----- htmlInit ----- //

    // http://jamesroberts.name/blog/2010/02/22/string-functions-for-javascript-trim-to-camel-case-to-dashed-and-to-underscore/
    utils.toDashed = function( str ) {
      return str.replace( /(.)([A-Z])/g, function( match, $1, $2 ) {
        return $1 + '-' + $2;
      }).toLowerCase();
    };

    var console = window.console;
    /**
     * allow user to initialize classes via [data-namespace] or .js-namespace class
     * htmlInit( Widget, 'widgetName' )
     * options are parsed from data-namespace-options
     */
    utils.htmlInit = function( WidgetClass, namespace ) {
      utils.docReady( function() {
        var dashedNamespace = utils.toDashed( namespace );
        var dataAttr = 'data-' + dashedNamespace;
        var dataAttrElems = document.querySelectorAll( '[' + dataAttr + ']' );
        var jsDashElems = document.querySelectorAll( '.js-' + dashedNamespace );
        var elems = utils.makeArray( dataAttrElems )
          .concat( utils.makeArray( jsDashElems ) );
        var dataOptionsAttr = dataAttr + '-options';
        var jQuery = window.jQuery;

        elems.forEach( function( elem ) {
          var attr = elem.getAttribute( dataAttr ) ||
            elem.getAttribute( dataOptionsAttr );
          var options;
          try {
            options = attr && JSON.parse( attr );
          } catch ( error ) {
            // log error, do not initialize
            if ( console ) {
              console.error( 'Error parsing ' + dataAttr + ' on ' + elem.className +
              ': ' + error );
            }
            return;
          }
          // initialize
          var instance = new WidgetClass( elem, options );
          // make available via $().data('namespace')
          if ( jQuery ) {
            jQuery.data( elem, namespace, instance );
          }
        });

      });
    };

    // -----  ----- //

    return utils;

    }));
    });

    var item = createCommonjsModule(function (module) {
    /**
     * Outlayer Item
     */

    ( function( window, factory ) {
      // universal module definition
      /* jshint strict: false */ /* globals define, module, require */
      if (  module.exports ) {
        // CommonJS - Browserify, Webpack
        module.exports = factory(
          evEmitter,
          getSize
        );
      } else {
        // browser global
        window.Outlayer = {};
        window.Outlayer.Item = factory(
          window.EvEmitter,
          window.getSize
        );
      }

    }( window, function factory( EvEmitter, getSize ) {

    // ----- helpers ----- //

    function isEmptyObj( obj ) {
      for ( var prop in obj ) {
        return false;
      }
      prop = null;
      return true;
    }

    // -------------------------- CSS3 support -------------------------- //


    var docElemStyle = document.documentElement.style;

    var transitionProperty = typeof docElemStyle.transition == 'string' ?
      'transition' : 'WebkitTransition';
    var transformProperty = typeof docElemStyle.transform == 'string' ?
      'transform' : 'WebkitTransform';

    var transitionEndEvent = {
      WebkitTransition: 'webkitTransitionEnd',
      transition: 'transitionend'
    }[ transitionProperty ];

    // cache all vendor properties that could have vendor prefix
    var vendorProperties = {
      transform: transformProperty,
      transition: transitionProperty,
      transitionDuration: transitionProperty + 'Duration',
      transitionProperty: transitionProperty + 'Property',
      transitionDelay: transitionProperty + 'Delay'
    };

    // -------------------------- Item -------------------------- //

    function Item( element, layout ) {
      if ( !element ) {
        return;
      }

      this.element = element;
      // parent layout class, i.e. Masonry, Isotope, or Packery
      this.layout = layout;
      this.position = {
        x: 0,
        y: 0
      };

      this._create();
    }

    // inherit EvEmitter
    var proto = Item.prototype = Object.create( EvEmitter.prototype );
    proto.constructor = Item;

    proto._create = function() {
      // transition objects
      this._transn = {
        ingProperties: {},
        clean: {},
        onEnd: {}
      };

      this.css({
        position: 'absolute'
      });
    };

    // trigger specified handler for event type
    proto.handleEvent = function( event ) {
      var method = 'on' + event.type;
      if ( this[ method ] ) {
        this[ method ]( event );
      }
    };

    proto.getSize = function() {
      this.size = getSize( this.element );
    };

    /**
     * apply CSS styles to element
     * @param {Object} style
     */
    proto.css = function( style ) {
      var elemStyle = this.element.style;

      for ( var prop in style ) {
        // use vendor property if available
        var supportedProp = vendorProperties[ prop ] || prop;
        elemStyle[ supportedProp ] = style[ prop ];
      }
    };

     // measure position, and sets it
    proto.getPosition = function() {
      var style = getComputedStyle( this.element );
      var isOriginLeft = this.layout._getOption('originLeft');
      var isOriginTop = this.layout._getOption('originTop');
      var xValue = style[ isOriginLeft ? 'left' : 'right' ];
      var yValue = style[ isOriginTop ? 'top' : 'bottom' ];
      var x = parseFloat( xValue );
      var y = parseFloat( yValue );
      // convert percent to pixels
      var layoutSize = this.layout.size;
      if ( xValue.indexOf('%') != -1 ) {
        x = ( x / 100 ) * layoutSize.width;
      }
      if ( yValue.indexOf('%') != -1 ) {
        y = ( y / 100 ) * layoutSize.height;
      }
      // clean up 'auto' or other non-integer values
      x = isNaN( x ) ? 0 : x;
      y = isNaN( y ) ? 0 : y;
      // remove padding from measurement
      x -= isOriginLeft ? layoutSize.paddingLeft : layoutSize.paddingRight;
      y -= isOriginTop ? layoutSize.paddingTop : layoutSize.paddingBottom;

      this.position.x = x;
      this.position.y = y;
    };

    // set settled position, apply padding
    proto.layoutPosition = function() {
      var layoutSize = this.layout.size;
      var style = {};
      var isOriginLeft = this.layout._getOption('originLeft');
      var isOriginTop = this.layout._getOption('originTop');

      // x
      var xPadding = isOriginLeft ? 'paddingLeft' : 'paddingRight';
      var xProperty = isOriginLeft ? 'left' : 'right';
      var xResetProperty = isOriginLeft ? 'right' : 'left';

      var x = this.position.x + layoutSize[ xPadding ];
      // set in percentage or pixels
      style[ xProperty ] = this.getXValue( x );
      // reset other property
      style[ xResetProperty ] = '';

      // y
      var yPadding = isOriginTop ? 'paddingTop' : 'paddingBottom';
      var yProperty = isOriginTop ? 'top' : 'bottom';
      var yResetProperty = isOriginTop ? 'bottom' : 'top';

      var y = this.position.y + layoutSize[ yPadding ];
      // set in percentage or pixels
      style[ yProperty ] = this.getYValue( y );
      // reset other property
      style[ yResetProperty ] = '';

      this.css( style );
      this.emitEvent( 'layout', [ this ] );
    };

    proto.getXValue = function( x ) {
      var isHorizontal = this.layout._getOption('horizontal');
      return this.layout.options.percentPosition && !isHorizontal ?
        ( ( x / this.layout.size.width ) * 100 ) + '%' : x + 'px';
    };

    proto.getYValue = function( y ) {
      var isHorizontal = this.layout._getOption('horizontal');
      return this.layout.options.percentPosition && isHorizontal ?
        ( ( y / this.layout.size.height ) * 100 ) + '%' : y + 'px';
    };

    proto._transitionTo = function( x, y ) {
      this.getPosition();
      // get current x & y from top/left
      var curX = this.position.x;
      var curY = this.position.y;

      var didNotMove = x == this.position.x && y == this.position.y;

      // save end position
      this.setPosition( x, y );

      // if did not move and not transitioning, just go to layout
      if ( didNotMove && !this.isTransitioning ) {
        this.layoutPosition();
        return;
      }

      var transX = x - curX;
      var transY = y - curY;
      var transitionStyle = {};
      transitionStyle.transform = this.getTranslate( transX, transY );

      this.transition({
        to: transitionStyle,
        onTransitionEnd: {
          transform: this.layoutPosition
        },
        isCleaning: true
      });
    };

    proto.getTranslate = function( x, y ) {
      // flip cooridinates if origin on right or bottom
      var isOriginLeft = this.layout._getOption('originLeft');
      var isOriginTop = this.layout._getOption('originTop');
      x = isOriginLeft ? x : -x;
      y = isOriginTop ? y : -y;
      return 'translate3d(' + x + 'px, ' + y + 'px, 0)';
    };

    // non transition + transform support
    proto.goTo = function( x, y ) {
      this.setPosition( x, y );
      this.layoutPosition();
    };

    proto.moveTo = proto._transitionTo;

    proto.setPosition = function( x, y ) {
      this.position.x = parseFloat( x );
      this.position.y = parseFloat( y );
    };

    // ----- transition ----- //

    /**
     * @param {Object} style - CSS
     * @param {Function} onTransitionEnd
     */

    // non transition, just trigger callback
    proto._nonTransition = function( args ) {
      this.css( args.to );
      if ( args.isCleaning ) {
        this._removeStyles( args.to );
      }
      for ( var prop in args.onTransitionEnd ) {
        args.onTransitionEnd[ prop ].call( this );
      }
    };

    /**
     * proper transition
     * @param {Object} args - arguments
     *   @param {Object} to - style to transition to
     *   @param {Object} from - style to start transition from
     *   @param {Boolean} isCleaning - removes transition styles after transition
     *   @param {Function} onTransitionEnd - callback
     */
    proto.transition = function( args ) {
      // redirect to nonTransition if no transition duration
      if ( !parseFloat( this.layout.options.transitionDuration ) ) {
        this._nonTransition( args );
        return;
      }

      var _transition = this._transn;
      // keep track of onTransitionEnd callback by css property
      for ( var prop in args.onTransitionEnd ) {
        _transition.onEnd[ prop ] = args.onTransitionEnd[ prop ];
      }
      // keep track of properties that are transitioning
      for ( prop in args.to ) {
        _transition.ingProperties[ prop ] = true;
        // keep track of properties to clean up when transition is done
        if ( args.isCleaning ) {
          _transition.clean[ prop ] = true;
        }
      }

      // set from styles
      if ( args.from ) {
        this.css( args.from );
        // force redraw. http://blog.alexmaccaw.com/css-transitions
        var h = this.element.offsetHeight;
        // hack for JSHint to hush about unused var
        h = null;
      }
      // enable transition
      this.enableTransition( args.to );
      // set styles that are transitioning
      this.css( args.to );

      this.isTransitioning = true;

    };

    // dash before all cap letters, including first for
    // WebkitTransform => -webkit-transform
    function toDashedAll( str ) {
      return str.replace( /([A-Z])/g, function( $1 ) {
        return '-' + $1.toLowerCase();
      });
    }

    var transitionProps = 'opacity,' + toDashedAll( transformProperty );

    proto.enableTransition = function(/* style */) {
      // HACK changing transitionProperty during a transition
      // will cause transition to jump
      if ( this.isTransitioning ) {
        return;
      }

      // make `transition: foo, bar, baz` from style object
      // HACK un-comment this when enableTransition can work
      // while a transition is happening
      // var transitionValues = [];
      // for ( var prop in style ) {
      //   // dash-ify camelCased properties like WebkitTransition
      //   prop = vendorProperties[ prop ] || prop;
      //   transitionValues.push( toDashedAll( prop ) );
      // }
      // munge number to millisecond, to match stagger
      var duration = this.layout.options.transitionDuration;
      duration = typeof duration == 'number' ? duration + 'ms' : duration;
      // enable transition styles
      this.css({
        transitionProperty: transitionProps,
        transitionDuration: duration,
        transitionDelay: this.staggerDelay || 0
      });
      // listen for transition end event
      this.element.addEventListener( transitionEndEvent, this, false );
    };

    // ----- events ----- //

    proto.onwebkitTransitionEnd = function( event ) {
      this.ontransitionend( event );
    };

    proto.onotransitionend = function( event ) {
      this.ontransitionend( event );
    };

    // properties that I munge to make my life easier
    var dashedVendorProperties = {
      '-webkit-transform': 'transform'
    };

    proto.ontransitionend = function( event ) {
      // disregard bubbled events from children
      if ( event.target !== this.element ) {
        return;
      }
      var _transition = this._transn;
      // get property name of transitioned property, convert to prefix-free
      var propertyName = dashedVendorProperties[ event.propertyName ] || event.propertyName;

      // remove property that has completed transitioning
      delete _transition.ingProperties[ propertyName ];
      // check if any properties are still transitioning
      if ( isEmptyObj( _transition.ingProperties ) ) {
        // all properties have completed transitioning
        this.disableTransition();
      }
      // clean style
      if ( propertyName in _transition.clean ) {
        // clean up style
        this.element.style[ event.propertyName ] = '';
        delete _transition.clean[ propertyName ];
      }
      // trigger onTransitionEnd callback
      if ( propertyName in _transition.onEnd ) {
        var onTransitionEnd = _transition.onEnd[ propertyName ];
        onTransitionEnd.call( this );
        delete _transition.onEnd[ propertyName ];
      }

      this.emitEvent( 'transitionEnd', [ this ] );
    };

    proto.disableTransition = function() {
      this.removeTransitionStyles();
      this.element.removeEventListener( transitionEndEvent, this, false );
      this.isTransitioning = false;
    };

    /**
     * removes style property from element
     * @param {Object} style
    **/
    proto._removeStyles = function( style ) {
      // clean up transition styles
      var cleanStyle = {};
      for ( var prop in style ) {
        cleanStyle[ prop ] = '';
      }
      this.css( cleanStyle );
    };

    var cleanTransitionStyle = {
      transitionProperty: '',
      transitionDuration: '',
      transitionDelay: ''
    };

    proto.removeTransitionStyles = function() {
      // remove transition
      this.css( cleanTransitionStyle );
    };

    // ----- stagger ----- //

    proto.stagger = function( delay ) {
      delay = isNaN( delay ) ? 0 : delay;
      this.staggerDelay = delay + 'ms';
    };

    // ----- show/hide/remove ----- //

    // remove element from DOM
    proto.removeElem = function() {
      this.element.parentNode.removeChild( this.element );
      // remove display: none
      this.css({ display: '' });
      this.emitEvent( 'remove', [ this ] );
    };

    proto.remove = function() {
      // just remove element if no transition support or no transition
      if ( !transitionProperty || !parseFloat( this.layout.options.transitionDuration ) ) {
        this.removeElem();
        return;
      }

      // start transition
      this.once( 'transitionEnd', function() {
        this.removeElem();
      });
      this.hide();
    };

    proto.reveal = function() {
      delete this.isHidden;
      // remove display: none
      this.css({ display: '' });

      var options = this.layout.options;

      var onTransitionEnd = {};
      var transitionEndProperty = this.getHideRevealTransitionEndProperty('visibleStyle');
      onTransitionEnd[ transitionEndProperty ] = this.onRevealTransitionEnd;

      this.transition({
        from: options.hiddenStyle,
        to: options.visibleStyle,
        isCleaning: true,
        onTransitionEnd: onTransitionEnd
      });
    };

    proto.onRevealTransitionEnd = function() {
      // check if still visible
      // during transition, item may have been hidden
      if ( !this.isHidden ) {
        this.emitEvent('reveal');
      }
    };

    /**
     * get style property use for hide/reveal transition end
     * @param {String} styleProperty - hiddenStyle/visibleStyle
     * @returns {String}
     */
    proto.getHideRevealTransitionEndProperty = function( styleProperty ) {
      var optionStyle = this.layout.options[ styleProperty ];
      // use opacity
      if ( optionStyle.opacity ) {
        return 'opacity';
      }
      // get first property
      for ( var prop in optionStyle ) {
        return prop;
      }
    };

    proto.hide = function() {
      // set flag
      this.isHidden = true;
      // remove display: none
      this.css({ display: '' });

      var options = this.layout.options;

      var onTransitionEnd = {};
      var transitionEndProperty = this.getHideRevealTransitionEndProperty('hiddenStyle');
      onTransitionEnd[ transitionEndProperty ] = this.onHideTransitionEnd;

      this.transition({
        from: options.visibleStyle,
        to: options.hiddenStyle,
        // keep hidden stuff hidden
        isCleaning: true,
        onTransitionEnd: onTransitionEnd
      });
    };

    proto.onHideTransitionEnd = function() {
      // check if still hidden
      // during transition, item may have been un-hidden
      if ( this.isHidden ) {
        this.css({ display: 'none' });
        this.emitEvent('hide');
      }
    };

    proto.destroy = function() {
      this.css({
        position: '',
        left: '',
        right: '',
        top: '',
        bottom: '',
        transition: '',
        transform: ''
      });
    };

    return Item;

    }));
    });

    var outlayer = createCommonjsModule(function (module) {
    /*!
     * Outlayer v2.1.1
     * the brains and guts of a layout library
     * MIT license
     */

    ( function( window, factory ) {
      // universal module definition
      /* jshint strict: false */ /* globals define, module, require */
      if (  module.exports ) {
        // CommonJS - Browserify, Webpack
        module.exports = factory(
          window,
          evEmitter,
          getSize,
          utils$1,
          item
        );
      } else {
        // browser global
        window.Outlayer = factory(
          window,
          window.EvEmitter,
          window.getSize,
          window.fizzyUIUtils,
          window.Outlayer.Item
        );
      }

    }( window, function factory( window, EvEmitter, getSize, utils, Item ) {

    // ----- vars ----- //

    var console = window.console;
    var jQuery = window.jQuery;
    var noop = function() {};

    // -------------------------- Outlayer -------------------------- //

    // globally unique identifiers
    var GUID = 0;
    // internal store of all Outlayer intances
    var instances = {};


    /**
     * @param {Element, String} element
     * @param {Object} options
     * @constructor
     */
    function Outlayer( element, options ) {
      var queryElement = utils.getQueryElement( element );
      if ( !queryElement ) {
        if ( console ) {
          console.error( 'Bad element for ' + this.constructor.namespace +
            ': ' + ( queryElement || element ) );
        }
        return;
      }
      this.element = queryElement;
      // add jQuery
      if ( jQuery ) {
        this.$element = jQuery( this.element );
      }

      // options
      this.options = utils.extend( {}, this.constructor.defaults );
      this.option( options );

      // add id for Outlayer.getFromElement
      var id = ++GUID;
      this.element.outlayerGUID = id; // expando
      instances[ id ] = this; // associate via id

      // kick it off
      this._create();

      var isInitLayout = this._getOption('initLayout');
      if ( isInitLayout ) {
        this.layout();
      }
    }

    // settings are for internal use only
    Outlayer.namespace = 'outlayer';
    Outlayer.Item = Item;

    // default options
    Outlayer.defaults = {
      containerStyle: {
        position: 'relative'
      },
      initLayout: true,
      originLeft: true,
      originTop: true,
      resize: true,
      resizeContainer: true,
      // item options
      transitionDuration: '0.4s',
      hiddenStyle: {
        opacity: 0,
        transform: 'scale(0.001)'
      },
      visibleStyle: {
        opacity: 1,
        transform: 'scale(1)'
      }
    };

    var proto = Outlayer.prototype;
    // inherit EvEmitter
    utils.extend( proto, EvEmitter.prototype );

    /**
     * set options
     * @param {Object} opts
     */
    proto.option = function( opts ) {
      utils.extend( this.options, opts );
    };

    /**
     * get backwards compatible option value, check old name
     */
    proto._getOption = function( option ) {
      var oldOption = this.constructor.compatOptions[ option ];
      return oldOption && this.options[ oldOption ] !== undefined ?
        this.options[ oldOption ] : this.options[ option ];
    };

    Outlayer.compatOptions = {
      // currentName: oldName
      initLayout: 'isInitLayout',
      horizontal: 'isHorizontal',
      layoutInstant: 'isLayoutInstant',
      originLeft: 'isOriginLeft',
      originTop: 'isOriginTop',
      resize: 'isResizeBound',
      resizeContainer: 'isResizingContainer'
    };

    proto._create = function() {
      // get items from children
      this.reloadItems();
      // elements that affect layout, but are not laid out
      this.stamps = [];
      this.stamp( this.options.stamp );
      // set container style
      utils.extend( this.element.style, this.options.containerStyle );

      // bind resize method
      var canBindResize = this._getOption('resize');
      if ( canBindResize ) {
        this.bindResize();
      }
    };

    // goes through all children again and gets bricks in proper order
    proto.reloadItems = function() {
      // collection of item elements
      this.items = this._itemize( this.element.children );
    };


    /**
     * turn elements into Outlayer.Items to be used in layout
     * @param {Array or NodeList or HTMLElement} elems
     * @returns {Array} items - collection of new Outlayer Items
     */
    proto._itemize = function( elems ) {

      var itemElems = this._filterFindItemElements( elems );
      var Item = this.constructor.Item;

      // create new Outlayer Items for collection
      var items = [];
      for ( var i=0; i < itemElems.length; i++ ) {
        var elem = itemElems[i];
        var item = new Item( elem, this );
        items.push( item );
      }

      return items;
    };

    /**
     * get item elements to be used in layout
     * @param {Array or NodeList or HTMLElement} elems
     * @returns {Array} items - item elements
     */
    proto._filterFindItemElements = function( elems ) {
      return utils.filterFindElements( elems, this.options.itemSelector );
    };

    /**
     * getter method for getting item elements
     * @returns {Array} elems - collection of item elements
     */
    proto.getItemElements = function() {
      return this.items.map( function( item ) {
        return item.element;
      });
    };

    // ----- init & layout ----- //

    /**
     * lays out all items
     */
    proto.layout = function() {
      this._resetLayout();
      this._manageStamps();

      // don't animate first layout
      var layoutInstant = this._getOption('layoutInstant');
      var isInstant = layoutInstant !== undefined ?
        layoutInstant : !this._isLayoutInited;
      this.layoutItems( this.items, isInstant );

      // flag for initalized
      this._isLayoutInited = true;
    };

    // _init is alias for layout
    proto._init = proto.layout;

    /**
     * logic before any new layout
     */
    proto._resetLayout = function() {
      this.getSize();
    };


    proto.getSize = function() {
      this.size = getSize( this.element );
    };

    /**
     * get measurement from option, for columnWidth, rowHeight, gutter
     * if option is String -> get element from selector string, & get size of element
     * if option is Element -> get size of element
     * else use option as a number
     *
     * @param {String} measurement
     * @param {String} size - width or height
     * @private
     */
    proto._getMeasurement = function( measurement, size ) {
      var option = this.options[ measurement ];
      var elem;
      if ( !option ) {
        // default to 0
        this[ measurement ] = 0;
      } else {
        // use option as an element
        if ( typeof option == 'string' ) {
          elem = this.element.querySelector( option );
        } else if ( option instanceof HTMLElement ) {
          elem = option;
        }
        // use size of element, if element
        this[ measurement ] = elem ? getSize( elem )[ size ] : option;
      }
    };

    /**
     * layout a collection of item elements
     * @api public
     */
    proto.layoutItems = function( items, isInstant ) {
      items = this._getItemsForLayout( items );

      this._layoutItems( items, isInstant );

      this._postLayout();
    };

    /**
     * get the items to be laid out
     * you may want to skip over some items
     * @param {Array} items
     * @returns {Array} items
     */
    proto._getItemsForLayout = function( items ) {
      return items.filter( function( item ) {
        return !item.isIgnored;
      });
    };

    /**
     * layout items
     * @param {Array} items
     * @param {Boolean} isInstant
     */
    proto._layoutItems = function( items, isInstant ) {
      this._emitCompleteOnItems( 'layout', items );

      if ( !items || !items.length ) {
        // no items, emit event with empty array
        return;
      }

      var queue = [];

      items.forEach( function( item ) {
        // get x/y object from method
        var position = this._getItemLayoutPosition( item );
        // enqueue
        position.item = item;
        position.isInstant = isInstant || item.isLayoutInstant;
        queue.push( position );
      }, this );

      this._processLayoutQueue( queue );
    };

    /**
     * get item layout position
     * @param {Outlayer.Item} item
     * @returns {Object} x and y position
     */
    proto._getItemLayoutPosition = function( /* item */ ) {
      return {
        x: 0,
        y: 0
      };
    };

    /**
     * iterate over array and position each item
     * Reason being - separating this logic prevents 'layout invalidation'
     * thx @paul_irish
     * @param {Array} queue
     */
    proto._processLayoutQueue = function( queue ) {
      this.updateStagger();
      queue.forEach( function( obj, i ) {
        this._positionItem( obj.item, obj.x, obj.y, obj.isInstant, i );
      }, this );
    };

    // set stagger from option in milliseconds number
    proto.updateStagger = function() {
      var stagger = this.options.stagger;
      if ( stagger === null || stagger === undefined ) {
        this.stagger = 0;
        return;
      }
      this.stagger = getMilliseconds( stagger );
      return this.stagger;
    };

    /**
     * Sets position of item in DOM
     * @param {Outlayer.Item} item
     * @param {Number} x - horizontal position
     * @param {Number} y - vertical position
     * @param {Boolean} isInstant - disables transitions
     */
    proto._positionItem = function( item, x, y, isInstant, i ) {
      if ( isInstant ) {
        // if not transition, just set CSS
        item.goTo( x, y );
      } else {
        item.stagger( i * this.stagger );
        item.moveTo( x, y );
      }
    };

    /**
     * Any logic you want to do after each layout,
     * i.e. size the container
     */
    proto._postLayout = function() {
      this.resizeContainer();
    };

    proto.resizeContainer = function() {
      var isResizingContainer = this._getOption('resizeContainer');
      if ( !isResizingContainer ) {
        return;
      }
      var size = this._getContainerSize();
      if ( size ) {
        this._setContainerMeasure( size.width, true );
        this._setContainerMeasure( size.height, false );
      }
    };

    /**
     * Sets width or height of container if returned
     * @returns {Object} size
     *   @param {Number} width
     *   @param {Number} height
     */
    proto._getContainerSize = noop;

    /**
     * @param {Number} measure - size of width or height
     * @param {Boolean} isWidth
     */
    proto._setContainerMeasure = function( measure, isWidth ) {
      if ( measure === undefined ) {
        return;
      }

      var elemSize = this.size;
      // add padding and border width if border box
      if ( elemSize.isBorderBox ) {
        measure += isWidth ? elemSize.paddingLeft + elemSize.paddingRight +
          elemSize.borderLeftWidth + elemSize.borderRightWidth :
          elemSize.paddingBottom + elemSize.paddingTop +
          elemSize.borderTopWidth + elemSize.borderBottomWidth;
      }

      measure = Math.max( measure, 0 );
      this.element.style[ isWidth ? 'width' : 'height' ] = measure + 'px';
    };

    /**
     * emit eventComplete on a collection of items events
     * @param {String} eventName
     * @param {Array} items - Outlayer.Items
     */
    proto._emitCompleteOnItems = function( eventName, items ) {
      var _this = this;
      function onComplete() {
        _this.dispatchEvent( eventName + 'Complete', null, [ items ] );
      }

      var count = items.length;
      if ( !items || !count ) {
        onComplete();
        return;
      }

      var doneCount = 0;
      function tick() {
        doneCount++;
        if ( doneCount == count ) {
          onComplete();
        }
      }

      // bind callback
      items.forEach( function( item ) {
        item.once( eventName, tick );
      });
    };

    /**
     * emits events via EvEmitter and jQuery events
     * @param {String} type - name of event
     * @param {Event} event - original event
     * @param {Array} args - extra arguments
     */
    proto.dispatchEvent = function( type, event, args ) {
      // add original event to arguments
      var emitArgs = event ? [ event ].concat( args ) : args;
      this.emitEvent( type, emitArgs );

      if ( jQuery ) {
        // set this.$element
        this.$element = this.$element || jQuery( this.element );
        if ( event ) {
          // create jQuery event
          var $event = jQuery.Event( event );
          $event.type = type;
          this.$element.trigger( $event, args );
        } else {
          // just trigger with type if no event available
          this.$element.trigger( type, args );
        }
      }
    };

    // -------------------------- ignore & stamps -------------------------- //


    /**
     * keep item in collection, but do not lay it out
     * ignored items do not get skipped in layout
     * @param {Element} elem
     */
    proto.ignore = function( elem ) {
      var item = this.getItem( elem );
      if ( item ) {
        item.isIgnored = true;
      }
    };

    /**
     * return item to layout collection
     * @param {Element} elem
     */
    proto.unignore = function( elem ) {
      var item = this.getItem( elem );
      if ( item ) {
        delete item.isIgnored;
      }
    };

    /**
     * adds elements to stamps
     * @param {NodeList, Array, Element, or String} elems
     */
    proto.stamp = function( elems ) {
      elems = this._find( elems );
      if ( !elems ) {
        return;
      }

      this.stamps = this.stamps.concat( elems );
      // ignore
      elems.forEach( this.ignore, this );
    };

    /**
     * removes elements to stamps
     * @param {NodeList, Array, or Element} elems
     */
    proto.unstamp = function( elems ) {
      elems = this._find( elems );
      if ( !elems ){
        return;
      }

      elems.forEach( function( elem ) {
        // filter out removed stamp elements
        utils.removeFrom( this.stamps, elem );
        this.unignore( elem );
      }, this );
    };

    /**
     * finds child elements
     * @param {NodeList, Array, Element, or String} elems
     * @returns {Array} elems
     */
    proto._find = function( elems ) {
      if ( !elems ) {
        return;
      }
      // if string, use argument as selector string
      if ( typeof elems == 'string' ) {
        elems = this.element.querySelectorAll( elems );
      }
      elems = utils.makeArray( elems );
      return elems;
    };

    proto._manageStamps = function() {
      if ( !this.stamps || !this.stamps.length ) {
        return;
      }

      this._getBoundingRect();

      this.stamps.forEach( this._manageStamp, this );
    };

    // update boundingLeft / Top
    proto._getBoundingRect = function() {
      // get bounding rect for container element
      var boundingRect = this.element.getBoundingClientRect();
      var size = this.size;
      this._boundingRect = {
        left: boundingRect.left + size.paddingLeft + size.borderLeftWidth,
        top: boundingRect.top + size.paddingTop + size.borderTopWidth,
        right: boundingRect.right - ( size.paddingRight + size.borderRightWidth ),
        bottom: boundingRect.bottom - ( size.paddingBottom + size.borderBottomWidth )
      };
    };

    /**
     * @param {Element} stamp
    **/
    proto._manageStamp = noop;

    /**
     * get x/y position of element relative to container element
     * @param {Element} elem
     * @returns {Object} offset - has left, top, right, bottom
     */
    proto._getElementOffset = function( elem ) {
      var boundingRect = elem.getBoundingClientRect();
      var thisRect = this._boundingRect;
      var size = getSize( elem );
      var offset = {
        left: boundingRect.left - thisRect.left - size.marginLeft,
        top: boundingRect.top - thisRect.top - size.marginTop,
        right: thisRect.right - boundingRect.right - size.marginRight,
        bottom: thisRect.bottom - boundingRect.bottom - size.marginBottom
      };
      return offset;
    };

    // -------------------------- resize -------------------------- //

    // enable event handlers for listeners
    // i.e. resize -> onresize
    proto.handleEvent = utils.handleEvent;

    /**
     * Bind layout to window resizing
     */
    proto.bindResize = function() {
      window.addEventListener( 'resize', this );
      this.isResizeBound = true;
    };

    /**
     * Unbind layout to window resizing
     */
    proto.unbindResize = function() {
      window.removeEventListener( 'resize', this );
      this.isResizeBound = false;
    };

    proto.onresize = function() {
      this.resize();
    };

    utils.debounceMethod( Outlayer, 'onresize', 100 );

    proto.resize = function() {
      // don't trigger if size did not change
      // or if resize was unbound. See #9
      if ( !this.isResizeBound || !this.needsResizeLayout() ) {
        return;
      }

      this.layout();
    };

    /**
     * check if layout is needed post layout
     * @returns Boolean
     */
    proto.needsResizeLayout = function() {
      var size = getSize( this.element );
      // check that this.size and size are there
      // IE8 triggers resize on body size change, so they might not be
      var hasSizes = this.size && size;
      return hasSizes && size.innerWidth !== this.size.innerWidth;
    };

    // -------------------------- methods -------------------------- //

    /**
     * add items to Outlayer instance
     * @param {Array or NodeList or Element} elems
     * @returns {Array} items - Outlayer.Items
    **/
    proto.addItems = function( elems ) {
      var items = this._itemize( elems );
      // add items to collection
      if ( items.length ) {
        this.items = this.items.concat( items );
      }
      return items;
    };

    /**
     * Layout newly-appended item elements
     * @param {Array or NodeList or Element} elems
     */
    proto.appended = function( elems ) {
      var items = this.addItems( elems );
      if ( !items.length ) {
        return;
      }
      // layout and reveal just the new items
      this.layoutItems( items, true );
      this.reveal( items );
    };

    /**
     * Layout prepended elements
     * @param {Array or NodeList or Element} elems
     */
    proto.prepended = function( elems ) {
      var items = this._itemize( elems );
      if ( !items.length ) {
        return;
      }
      // add items to beginning of collection
      var previousItems = this.items.slice(0);
      this.items = items.concat( previousItems );
      // start new layout
      this._resetLayout();
      this._manageStamps();
      // layout new stuff without transition
      this.layoutItems( items, true );
      this.reveal( items );
      // layout previous items
      this.layoutItems( previousItems );
    };

    /**
     * reveal a collection of items
     * @param {Array of Outlayer.Items} items
     */
    proto.reveal = function( items ) {
      this._emitCompleteOnItems( 'reveal', items );
      if ( !items || !items.length ) {
        return;
      }
      var stagger = this.updateStagger();
      items.forEach( function( item, i ) {
        item.stagger( i * stagger );
        item.reveal();
      });
    };

    /**
     * hide a collection of items
     * @param {Array of Outlayer.Items} items
     */
    proto.hide = function( items ) {
      this._emitCompleteOnItems( 'hide', items );
      if ( !items || !items.length ) {
        return;
      }
      var stagger = this.updateStagger();
      items.forEach( function( item, i ) {
        item.stagger( i * stagger );
        item.hide();
      });
    };

    /**
     * reveal item elements
     * @param {Array}, {Element}, {NodeList} items
     */
    proto.revealItemElements = function( elems ) {
      var items = this.getItems( elems );
      this.reveal( items );
    };

    /**
     * hide item elements
     * @param {Array}, {Element}, {NodeList} items
     */
    proto.hideItemElements = function( elems ) {
      var items = this.getItems( elems );
      this.hide( items );
    };

    /**
     * get Outlayer.Item, given an Element
     * @param {Element} elem
     * @param {Function} callback
     * @returns {Outlayer.Item} item
     */
    proto.getItem = function( elem ) {
      // loop through items to get the one that matches
      for ( var i=0; i < this.items.length; i++ ) {
        var item = this.items[i];
        if ( item.element == elem ) {
          // return item
          return item;
        }
      }
    };

    /**
     * get collection of Outlayer.Items, given Elements
     * @param {Array} elems
     * @returns {Array} items - Outlayer.Items
     */
    proto.getItems = function( elems ) {
      elems = utils.makeArray( elems );
      var items = [];
      elems.forEach( function( elem ) {
        var item = this.getItem( elem );
        if ( item ) {
          items.push( item );
        }
      }, this );

      return items;
    };

    /**
     * remove element(s) from instance and DOM
     * @param {Array or NodeList or Element} elems
     */
    proto.remove = function( elems ) {
      var removeItems = this.getItems( elems );

      this._emitCompleteOnItems( 'remove', removeItems );

      // bail if no items to remove
      if ( !removeItems || !removeItems.length ) {
        return;
      }

      removeItems.forEach( function( item ) {
        item.remove();
        // remove item from collection
        utils.removeFrom( this.items, item );
      }, this );
    };

    // ----- destroy ----- //

    // remove and disable Outlayer instance
    proto.destroy = function() {
      // clean up dynamic styles
      var style = this.element.style;
      style.height = '';
      style.position = '';
      style.width = '';
      // destroy items
      this.items.forEach( function( item ) {
        item.destroy();
      });

      this.unbindResize();

      var id = this.element.outlayerGUID;
      delete instances[ id ]; // remove reference to instance by id
      delete this.element.outlayerGUID;
      // remove data for jQuery
      if ( jQuery ) {
        jQuery.removeData( this.element, this.constructor.namespace );
      }

    };

    // -------------------------- data -------------------------- //

    /**
     * get Outlayer instance from element
     * @param {Element} elem
     * @returns {Outlayer}
     */
    Outlayer.data = function( elem ) {
      elem = utils.getQueryElement( elem );
      var id = elem && elem.outlayerGUID;
      return id && instances[ id ];
    };


    // -------------------------- create Outlayer class -------------------------- //

    /**
     * create a layout class
     * @param {String} namespace
     */
    Outlayer.create = function( namespace, options ) {
      // sub-class Outlayer
      var Layout = subclass( Outlayer );
      // apply new options and compatOptions
      Layout.defaults = utils.extend( {}, Outlayer.defaults );
      utils.extend( Layout.defaults, options );
      Layout.compatOptions = utils.extend( {}, Outlayer.compatOptions  );

      Layout.namespace = namespace;

      Layout.data = Outlayer.data;

      // sub-class Item
      Layout.Item = subclass( Item );

      // -------------------------- declarative -------------------------- //

      utils.htmlInit( Layout, namespace );

      // -------------------------- jQuery bridge -------------------------- //

      // make into jQuery plugin
      if ( jQuery && jQuery.bridget ) {
        jQuery.bridget( namespace, Layout );
      }

      return Layout;
    };

    function subclass( Parent ) {
      function SubClass() {
        Parent.apply( this, arguments );
      }

      SubClass.prototype = Object.create( Parent.prototype );
      SubClass.prototype.constructor = SubClass;

      return SubClass;
    }

    // ----- helpers ----- //

    // how many milliseconds are in each unit
    var msUnits = {
      ms: 1,
      s: 1000
    };

    // munge time-like parameter into millisecond number
    // '0.4s' -> 40
    function getMilliseconds( time ) {
      if ( typeof time == 'number' ) {
        return time;
      }
      var matches = time.match( /(^\d*\.?\d*)(\w*)/ );
      var num = matches && matches[1];
      var unit = matches && matches[2];
      if ( !num.length ) {
        return 0;
      }
      num = parseFloat( num );
      var mult = msUnits[ unit ] || 1;
      return num * mult;
    }

    // ----- fin ----- //

    // back in global
    Outlayer.Item = Item;

    return Outlayer;

    }));
    });

    var masonry = createCommonjsModule(function (module) {
    /*!
     * Masonry v4.2.2
     * Cascading grid layout library
     * https://masonry.desandro.com
     * MIT License
     * by David DeSandro
     */

    ( function( window, factory ) {
      // universal module definition
      /* jshint strict: false */ /*globals define, module, require */
      if (  module.exports ) {
        // CommonJS
        module.exports = factory(
          outlayer,
          getSize
        );
      } else {
        // browser global
        window.Masonry = factory(
          window.Outlayer,
          window.getSize
        );
      }

    }( window, function factory( Outlayer, getSize ) {

    // -------------------------- masonryDefinition -------------------------- //

      // create an Outlayer layout class
      var Masonry = Outlayer.create('masonry');
      // isFitWidth -> fitWidth
      Masonry.compatOptions.fitWidth = 'isFitWidth';

      var proto = Masonry.prototype;

      proto._resetLayout = function() {
        this.getSize();
        this._getMeasurement( 'columnWidth', 'outerWidth' );
        this._getMeasurement( 'gutter', 'outerWidth' );
        this.measureColumns();

        // reset column Y
        this.colYs = [];
        for ( var i=0; i < this.cols; i++ ) {
          this.colYs.push( 0 );
        }

        this.maxY = 0;
        this.horizontalColIndex = 0;
      };

      proto.measureColumns = function() {
        this.getContainerWidth();
        // if columnWidth is 0, default to outerWidth of first item
        if ( !this.columnWidth ) {
          var firstItem = this.items[0];
          var firstItemElem = firstItem && firstItem.element;
          // columnWidth fall back to item of first element
          this.columnWidth = firstItemElem && getSize( firstItemElem ).outerWidth ||
            // if first elem has no width, default to size of container
            this.containerWidth;
        }

        var columnWidth = this.columnWidth += this.gutter;

        // calculate columns
        var containerWidth = this.containerWidth + this.gutter;
        var cols = containerWidth / columnWidth;
        // fix rounding errors, typically with gutters
        var excess = columnWidth - containerWidth % columnWidth;
        // if overshoot is less than a pixel, round up, otherwise floor it
        var mathMethod = excess && excess < 1 ? 'round' : 'floor';
        cols = Math[ mathMethod ]( cols );
        this.cols = Math.max( cols, 1 );
      };

      proto.getContainerWidth = function() {
        // container is parent if fit width
        var isFitWidth = this._getOption('fitWidth');
        var container = isFitWidth ? this.element.parentNode : this.element;
        // check that this.size and size are there
        // IE8 triggers resize on body size change, so they might not be
        var size = getSize( container );
        this.containerWidth = size && size.innerWidth;
      };

      proto._getItemLayoutPosition = function( item ) {
        item.getSize();
        // how many columns does this brick span
        var remainder = item.size.outerWidth % this.columnWidth;
        var mathMethod = remainder && remainder < 1 ? 'round' : 'ceil';
        // round if off by 1 pixel, otherwise use ceil
        var colSpan = Math[ mathMethod ]( item.size.outerWidth / this.columnWidth );
        colSpan = Math.min( colSpan, this.cols );
        // use horizontal or top column position
        var colPosMethod = this.options.horizontalOrder ?
          '_getHorizontalColPosition' : '_getTopColPosition';
        var colPosition = this[ colPosMethod ]( colSpan, item );
        // position the brick
        var position = {
          x: this.columnWidth * colPosition.col,
          y: colPosition.y
        };
        // apply setHeight to necessary columns
        var setHeight = colPosition.y + item.size.outerHeight;
        var setMax = colSpan + colPosition.col;
        for ( var i = colPosition.col; i < setMax; i++ ) {
          this.colYs[i] = setHeight;
        }

        return position;
      };

      proto._getTopColPosition = function( colSpan ) {
        var colGroup = this._getTopColGroup( colSpan );
        // get the minimum Y value from the columns
        var minimumY = Math.min.apply( Math, colGroup );

        return {
          col: colGroup.indexOf( minimumY ),
          y: minimumY,
        };
      };

      /**
       * @param {Number} colSpan - number of columns the element spans
       * @returns {Array} colGroup
       */
      proto._getTopColGroup = function( colSpan ) {
        if ( colSpan < 2 ) {
          // if brick spans only one column, use all the column Ys
          return this.colYs;
        }

        var colGroup = [];
        // how many different places could this brick fit horizontally
        var groupCount = this.cols + 1 - colSpan;
        // for each group potential horizontal position
        for ( var i = 0; i < groupCount; i++ ) {
          colGroup[i] = this._getColGroupY( i, colSpan );
        }
        return colGroup;
      };

      proto._getColGroupY = function( col, colSpan ) {
        if ( colSpan < 2 ) {
          return this.colYs[ col ];
        }
        // make an array of colY values for that one group
        var groupColYs = this.colYs.slice( col, col + colSpan );
        // and get the max value of the array
        return Math.max.apply( Math, groupColYs );
      };

      // get column position based on horizontal index. #873
      proto._getHorizontalColPosition = function( colSpan, item ) {
        var col = this.horizontalColIndex % this.cols;
        var isOver = colSpan > 1 && col + colSpan > this.cols;
        // shift to next row if item can't fit on current row
        col = isOver ? 0 : col;
        // don't let zero-size items take up space
        var hasSize = item.size.outerWidth && item.size.outerHeight;
        this.horizontalColIndex = hasSize ? col + colSpan : this.horizontalColIndex;

        return {
          col: col,
          y: this._getColGroupY( col, colSpan ),
        };
      };

      proto._manageStamp = function( stamp ) {
        var stampSize = getSize( stamp );
        var offset = this._getElementOffset( stamp );
        // get the columns that this stamp affects
        var isOriginLeft = this._getOption('originLeft');
        var firstX = isOriginLeft ? offset.left : offset.right;
        var lastX = firstX + stampSize.outerWidth;
        var firstCol = Math.floor( firstX / this.columnWidth );
        firstCol = Math.max( 0, firstCol );
        var lastCol = Math.floor( lastX / this.columnWidth );
        // lastCol should not go over if multiple of columnWidth #425
        lastCol -= lastX % this.columnWidth ? 0 : 1;
        lastCol = Math.min( this.cols - 1, lastCol );
        // set colYs to bottom of the stamp

        var isOriginTop = this._getOption('originTop');
        var stampMaxY = ( isOriginTop ? offset.top : offset.bottom ) +
          stampSize.outerHeight;
        for ( var i = firstCol; i <= lastCol; i++ ) {
          this.colYs[i] = Math.max( stampMaxY, this.colYs[i] );
        }
      };

      proto._getContainerSize = function() {
        this.maxY = Math.max.apply( Math, this.colYs );
        var size = {
          height: this.maxY
        };

        if ( this._getOption('fitWidth') ) {
          size.width = this._getContainerFitWidth();
        }

        return size;
      };

      proto._getContainerFitWidth = function() {
        var unusedCols = 0;
        // count unused columns
        var i = this.cols;
        while ( --i ) {
          if ( this.colYs[i] !== 0 ) {
            break;
          }
          unusedCols++;
        }
        // fit container to columns that have been used
        return ( this.cols - unusedCols ) * this.columnWidth - this.gutter;
      };

      proto.needsResizeLayout = function() {
        var previousWidth = this.containerWidth;
        this.getContainerWidth();
        return previousWidth != this.containerWidth;
      };

      return Masonry;

    }));
    });

    var imagesloaded = createCommonjsModule(function (module) {
    /*!
     * imagesLoaded v4.1.4
     * JavaScript is all like "You images are done yet or what?"
     * MIT License
     */

    ( function( window, factory ) {  // universal module definition

      /*global define: false, module: false, require: false */

      if (  module.exports ) {
        // CommonJS
        module.exports = factory(
          window,
          evEmitter
        );
      } else {
        // browser global
        window.imagesLoaded = factory(
          window,
          window.EvEmitter
        );
      }

    })( typeof window !== 'undefined' ? window : commonjsGlobal,

    // --------------------------  factory -------------------------- //

    function factory( window, EvEmitter ) {

    var $ = window.jQuery;
    var console = window.console;

    // -------------------------- helpers -------------------------- //

    // extend objects
    function extend( a, b ) {
      for ( var prop in b ) {
        a[ prop ] = b[ prop ];
      }
      return a;
    }

    var arraySlice = Array.prototype.slice;

    // turn element or nodeList into an array
    function makeArray( obj ) {
      if ( Array.isArray( obj ) ) {
        // use object if already an array
        return obj;
      }

      var isArrayLike = typeof obj == 'object' && typeof obj.length == 'number';
      if ( isArrayLike ) {
        // convert nodeList to array
        return arraySlice.call( obj );
      }

      // array of single index
      return [ obj ];
    }

    // -------------------------- imagesLoaded -------------------------- //

    /**
     * @param {Array, Element, NodeList, String} elem
     * @param {Object or Function} options - if function, use as callback
     * @param {Function} onAlways - callback function
     */
    function ImagesLoaded( elem, options, onAlways ) {
      // coerce ImagesLoaded() without new, to be new ImagesLoaded()
      if ( !( this instanceof ImagesLoaded ) ) {
        return new ImagesLoaded( elem, options, onAlways );
      }
      // use elem as selector string
      var queryElem = elem;
      if ( typeof elem == 'string' ) {
        queryElem = document.querySelectorAll( elem );
      }
      // bail if bad element
      if ( !queryElem ) {
        console.error( 'Bad element for imagesLoaded ' + ( queryElem || elem ) );
        return;
      }

      this.elements = makeArray( queryElem );
      this.options = extend( {}, this.options );
      // shift arguments if no options set
      if ( typeof options == 'function' ) {
        onAlways = options;
      } else {
        extend( this.options, options );
      }

      if ( onAlways ) {
        this.on( 'always', onAlways );
      }

      this.getImages();

      if ( $ ) {
        // add jQuery Deferred object
        this.jqDeferred = new $.Deferred();
      }

      // HACK check async to allow time to bind listeners
      setTimeout( this.check.bind( this ) );
    }

    ImagesLoaded.prototype = Object.create( EvEmitter.prototype );

    ImagesLoaded.prototype.options = {};

    ImagesLoaded.prototype.getImages = function() {
      this.images = [];

      // filter & find items if we have an item selector
      this.elements.forEach( this.addElementImages, this );
    };

    /**
     * @param {Node} element
     */
    ImagesLoaded.prototype.addElementImages = function( elem ) {
      // filter siblings
      if ( elem.nodeName == 'IMG' ) {
        this.addImage( elem );
      }
      // get background image on element
      if ( this.options.background === true ) {
        this.addElementBackgroundImages( elem );
      }

      // find children
      // no non-element nodes, #143
      var nodeType = elem.nodeType;
      if ( !nodeType || !elementNodeTypes[ nodeType ] ) {
        return;
      }
      var childImgs = elem.querySelectorAll('img');
      // concat childElems to filterFound array
      for ( var i=0; i < childImgs.length; i++ ) {
        var img = childImgs[i];
        this.addImage( img );
      }

      // get child background images
      if ( typeof this.options.background == 'string' ) {
        var children = elem.querySelectorAll( this.options.background );
        for ( i=0; i < children.length; i++ ) {
          var child = children[i];
          this.addElementBackgroundImages( child );
        }
      }
    };

    var elementNodeTypes = {
      1: true,
      9: true,
      11: true
    };

    ImagesLoaded.prototype.addElementBackgroundImages = function( elem ) {
      var style = getComputedStyle( elem );
      if ( !style ) {
        // Firefox returns null if in a hidden iframe https://bugzil.la/548397
        return;
      }
      // get url inside url("...")
      var reURL = /url\((['"])?(.*?)\1\)/gi;
      var matches = reURL.exec( style.backgroundImage );
      while ( matches !== null ) {
        var url = matches && matches[2];
        if ( url ) {
          this.addBackground( url, elem );
        }
        matches = reURL.exec( style.backgroundImage );
      }
    };

    /**
     * @param {Image} img
     */
    ImagesLoaded.prototype.addImage = function( img ) {
      var loadingImage = new LoadingImage( img );
      this.images.push( loadingImage );
    };

    ImagesLoaded.prototype.addBackground = function( url, elem ) {
      var background = new Background( url, elem );
      this.images.push( background );
    };

    ImagesLoaded.prototype.check = function() {
      var _this = this;
      this.progressedCount = 0;
      this.hasAnyBroken = false;
      // complete if no images
      if ( !this.images.length ) {
        this.complete();
        return;
      }

      function onProgress( image, elem, message ) {
        // HACK - Chrome triggers event before object properties have changed. #83
        setTimeout( function() {
          _this.progress( image, elem, message );
        });
      }

      this.images.forEach( function( loadingImage ) {
        loadingImage.once( 'progress', onProgress );
        loadingImage.check();
      });
    };

    ImagesLoaded.prototype.progress = function( image, elem, message ) {
      this.progressedCount++;
      this.hasAnyBroken = this.hasAnyBroken || !image.isLoaded;
      // progress event
      this.emitEvent( 'progress', [ this, image, elem ] );
      if ( this.jqDeferred && this.jqDeferred.notify ) {
        this.jqDeferred.notify( this, image );
      }
      // check if completed
      if ( this.progressedCount == this.images.length ) {
        this.complete();
      }

      if ( this.options.debug && console ) {
        console.log( 'progress: ' + message, image, elem );
      }
    };

    ImagesLoaded.prototype.complete = function() {
      var eventName = this.hasAnyBroken ? 'fail' : 'done';
      this.isComplete = true;
      this.emitEvent( eventName, [ this ] );
      this.emitEvent( 'always', [ this ] );
      if ( this.jqDeferred ) {
        var jqMethod = this.hasAnyBroken ? 'reject' : 'resolve';
        this.jqDeferred[ jqMethod ]( this );
      }
    };

    // --------------------------  -------------------------- //

    function LoadingImage( img ) {
      this.img = img;
    }

    LoadingImage.prototype = Object.create( EvEmitter.prototype );

    LoadingImage.prototype.check = function() {
      // If complete is true and browser supports natural sizes,
      // try to check for image status manually.
      var isComplete = this.getIsImageComplete();
      if ( isComplete ) {
        // report based on naturalWidth
        this.confirm( this.img.naturalWidth !== 0, 'naturalWidth' );
        return;
      }

      // If none of the checks above matched, simulate loading on detached element.
      this.proxyImage = new Image();
      this.proxyImage.addEventListener( 'load', this );
      this.proxyImage.addEventListener( 'error', this );
      // bind to image as well for Firefox. #191
      this.img.addEventListener( 'load', this );
      this.img.addEventListener( 'error', this );
      this.proxyImage.src = this.img.src;
    };

    LoadingImage.prototype.getIsImageComplete = function() {
      // check for non-zero, non-undefined naturalWidth
      // fixes Safari+InfiniteScroll+Masonry bug infinite-scroll#671
      return this.img.complete && this.img.naturalWidth;
    };

    LoadingImage.prototype.confirm = function( isLoaded, message ) {
      this.isLoaded = isLoaded;
      this.emitEvent( 'progress', [ this, this.img, message ] );
    };

    // ----- events ----- //

    // trigger specified handler for event type
    LoadingImage.prototype.handleEvent = function( event ) {
      var method = 'on' + event.type;
      if ( this[ method ] ) {
        this[ method ]( event );
      }
    };

    LoadingImage.prototype.onload = function() {
      this.confirm( true, 'onload' );
      this.unbindEvents();
    };

    LoadingImage.prototype.onerror = function() {
      this.confirm( false, 'onerror' );
      this.unbindEvents();
    };

    LoadingImage.prototype.unbindEvents = function() {
      this.proxyImage.removeEventListener( 'load', this );
      this.proxyImage.removeEventListener( 'error', this );
      this.img.removeEventListener( 'load', this );
      this.img.removeEventListener( 'error', this );
    };

    // -------------------------- Background -------------------------- //

    function Background( url, element ) {
      this.url = url;
      this.element = element;
      this.img = new Image();
    }

    // inherit LoadingImage prototype
    Background.prototype = Object.create( LoadingImage.prototype );

    Background.prototype.check = function() {
      this.img.addEventListener( 'load', this );
      this.img.addEventListener( 'error', this );
      this.img.src = this.url;
      // check if image is already complete
      var isComplete = this.getIsImageComplete();
      if ( isComplete ) {
        this.confirm( this.img.naturalWidth !== 0, 'naturalWidth' );
        this.unbindEvents();
      }
    };

    Background.prototype.unbindEvents = function() {
      this.img.removeEventListener( 'load', this );
      this.img.removeEventListener( 'error', this );
    };

    Background.prototype.confirm = function( isLoaded, message ) {
      this.isLoaded = isLoaded;
      this.emitEvent( 'progress', [ this, this.element, message ] );
    };

    // -------------------------- jQuery -------------------------- //

    ImagesLoaded.makeJQueryPlugin = function( jQuery ) {
      jQuery = jQuery || window.jQuery;
      if ( !jQuery ) {
        return;
      }
      // set local variable
      $ = jQuery;
      // $().imagesLoaded()
      $.fn.imagesLoaded = function( options, callback ) {
        var instance = new ImagesLoaded( this, options, callback );
        return instance.jqDeferred.promise( $(this) );
      };
    };
    // try making plugin
    ImagesLoaded.makeJQueryPlugin();

    // --------------------------  -------------------------- //

    return ImagesLoaded;

    });
    });

    /* src/components/gallery/GalleryPhotoSelect.svelte generated by Svelte v3.21.0 */
    const file$b = "src/components/gallery/GalleryPhotoSelect.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[4] = list[i];
    	return child_ctx;
    }

    // (110:4) {#each photo.array as item}
    function create_each_block$2(ctx) {
    	let div;
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			div = element("div");
    			img = element("img");
    			if (img.src !== (img_src_value = /*item*/ ctx[4])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "SRG photography image");
    			attr_dev(img, "class", "svelte-1mcxhe4");
    			add_location(img, file$b, 110, 32, 3269);
    			attr_dev(div, "class", "swiper-slide svelte-1mcxhe4");
    			add_location(div, file$b, 110, 6, 3243);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, img);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*photo*/ 1 && img.src !== (img_src_value = /*item*/ ctx[4])) {
    				attr_dev(img, "src", img_src_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(110:4) {#each photo.array as item}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$b(ctx) {
    	let div5;
    	let div0;
    	let i;
    	let t0;
    	let div4;
    	let div1;
    	let t1;
    	let div2;
    	let t2;
    	let div3;
    	let dispose;
    	let each_value = /*photo*/ ctx[0].array;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div5 = element("div");
    			div0 = element("div");
    			i = element("i");
    			t0 = space();
    			div4 = element("div");
    			div1 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t1 = space();
    			div2 = element("div");
    			t2 = space();
    			div3 = element("div");
    			attr_dev(i, "class", "fas fa-times close-button svelte-1mcxhe4");
    			add_location(i, file$b, 105, 4, 3051);
    			attr_dev(div0, "class", "photo-select__close svelte-1mcxhe4");
    			add_location(div0, file$b, 104, 2, 2976);
    			attr_dev(div1, "class", "swiper-wrapper");
    			add_location(div1, file$b, 108, 4, 3176);
    			attr_dev(div2, "class", "swiper-button-next svelte-1mcxhe4");
    			add_location(div2, file$b, 115, 4, 3374);
    			attr_dev(div3, "class", "swiper-button-prev svelte-1mcxhe4");
    			add_location(div3, file$b, 116, 4, 3417);
    			attr_dev(div4, "class", "swiper-container svelte-1mcxhe4");
    			add_location(div4, file$b, 107, 2, 3141);
    			attr_dev(div5, "class", "photo-select svelte-1mcxhe4");
    			add_location(div5, file$b, 103, 0, 2947);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, div5, anchor);
    			append_dev(div5, div0);
    			append_dev(div0, i);
    			append_dev(div5, t0);
    			append_dev(div5, div4);
    			append_dev(div4, div1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div1, null);
    			}

    			append_dev(div4, t1);
    			append_dev(div4, div2);
    			append_dev(div4, t2);
    			append_dev(div4, div3);
    			if (remount) run_all(dispose);

    			dispose = [
    				listen_dev(i, "click", /*click_handler*/ ctx[2], false, false, false),
    				listen_dev(div0, "click", /*click_handler_1*/ ctx[3], false, false, false)
    			];
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*photo*/ 1) {
    				each_value = /*photo*/ ctx[0].array;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div1, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div5);
    			destroy_each(each_blocks, detaching);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$b($$self, $$props, $$invalidate) {
    	let { photo } = $$props;

    	onMount(async () => {
    		var mySwiper = new Swiper(".swiper-container",
    		{
    				loop: true,
    				speed: 400,
    				effect: "slide",
    				initialSlide: photo.index,
    				keyboard: { enabled: true },
    				slidesPerView: 1,
    				// autoHeight: true,
    				spaceBetween: 20,
    				navigation: {
    					nextEl: ".swiper-button-next",
    					prevEl: ".swiper-button-prev"
    				}
    			});
    	});

    	const dispatch = createEventDispatcher();
    	const writable_props = ["photo"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<GalleryPhotoSelect> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("GalleryPhotoSelect", $$slots, []);
    	const click_handler = () => dispatch("close");
    	const click_handler_1 = () => dispatch("close");

    	$$self.$set = $$props => {
    		if ("photo" in $$props) $$invalidate(0, photo = $$props.photo);
    	};

    	$$self.$capture_state = () => ({
    		Swiper,
    		onMount,
    		photo,
    		createEventDispatcher,
    		dispatch
    	});

    	$$self.$inject_state = $$props => {
    		if ("photo" in $$props) $$invalidate(0, photo = $$props.photo);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [photo, dispatch, click_handler, click_handler_1];
    }

    class GalleryPhotoSelect extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$b, create_fragment$b, safe_not_equal, { photo: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "GalleryPhotoSelect",
    			options,
    			id: create_fragment$b.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*photo*/ ctx[0] === undefined && !("photo" in props)) {
    			console.warn("<GalleryPhotoSelect> was created without expected prop 'photo'");
    		}
    	}

    	get photo() {
    		throw new Error("<GalleryPhotoSelect>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set photo(value) {
    		throw new Error("<GalleryPhotoSelect>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/gallery/GalleryMasonry.svelte generated by Svelte v3.21.0 */
    const file$c = "src/components/gallery/GalleryMasonry.svelte";

    function get_each_context$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[12] = list[i];
    	child_ctx[14] = i;
    	return child_ctx;
    }

    // (124:4) {#if showImages !== true}
    function create_if_block_1$2(ctx) {
    	let div4;
    	let div0;
    	let div1;
    	let div2;
    	let div3;

    	const block = {
    		c: function create() {
    			div4 = element("div");
    			div0 = element("div");
    			div1 = element("div");
    			div2 = element("div");
    			div3 = element("div");
    			attr_dev(div0, "class", "svelte-smjo1f");
    			add_location(div0, file$c, 124, 30, 2680);
    			attr_dev(div1, "class", "svelte-smjo1f");
    			add_location(div1, file$c, 124, 41, 2691);
    			attr_dev(div2, "class", "svelte-smjo1f");
    			add_location(div2, file$c, 124, 52, 2702);
    			attr_dev(div3, "class", "svelte-smjo1f");
    			add_location(div3, file$c, 124, 63, 2713);
    			attr_dev(div4, "class", "lds-ring svelte-smjo1f");
    			add_location(div4, file$c, 124, 8, 2658);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div4, anchor);
    			append_dev(div4, div0);
    			append_dev(div4, div1);
    			append_dev(div4, div2);
    			append_dev(div4, div3);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div4);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$2.name,
    		type: "if",
    		source: "(124:4) {#if showImages !== true}",
    		ctx
    	});

    	return block;
    }

    // (128:8) {#each selectedArray as item, i}
    function create_each_block$3(ctx) {
    	let div;
    	let img;
    	let img_src_value;
    	let t;
    	let dispose;

    	function click_handler(...args) {
    		return /*click_handler*/ ctx[9](/*i*/ ctx[14], ...args);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			img = element("img");
    			t = space();
    			if (img.src !== (img_src_value = /*item*/ ctx[12])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "SRG photography image");
    			attr_dev(img, "class", "svelte-smjo1f");
    			add_location(img, file$c, 133, 16, 3184);
    			attr_dev(div, "data-sal", "slide-up");
    			attr_dev(div, "data-sal-delay", "0");
    			attr_dev(div, "data-sal-duration", "1000");
    			attr_dev(div, "data-sal-easing", "ease-out-bounce");
    			attr_dev(div, "class", "grid-item-preload grid-item svelte-smjo1f");
    			toggle_class(div, "show", /*showImages*/ ctx[3] == true);
    			add_location(div, file$c, 128, 12, 2834);
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, div, anchor);
    			append_dev(div, img);
    			append_dev(div, t);
    			/*div_binding*/ ctx[8](div);
    			if (remount) run_all(dispose);

    			dispose = [
    				listen_dev(img, "load", /*countImages*/ ctx[5], false, false, false),
    				listen_dev(div, "click", click_handler, false, false, false)
    			];
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty & /*showImages*/ 8) {
    				toggle_class(div, "show", /*showImages*/ ctx[3] == true);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			/*div_binding*/ ctx[8](null);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$3.name,
    		type: "each",
    		source: "(128:8) {#each selectedArray as item, i}",
    		ctx
    	});

    	return block;
    }

    // (142:0) {#if photo.open == true}
    function create_if_block$5(ctx) {
    	let div;
    	let div_transition;
    	let current;

    	const galleryphotoselect = new GalleryPhotoSelect({
    			props: { photo: /*photo*/ ctx[0] },
    			$$inline: true
    		});

    	galleryphotoselect.$on("close", /*close_handler*/ ctx[11]);

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(galleryphotoselect.$$.fragment);
    			add_location(div, file$c, 142, 4, 3338);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(galleryphotoselect, div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const galleryphotoselect_changes = {};
    			if (dirty & /*photo*/ 1) galleryphotoselect_changes.photo = /*photo*/ ctx[0];
    			galleryphotoselect.$set(galleryphotoselect_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(galleryphotoselect.$$.fragment, local);

    			add_render_callback(() => {
    				if (!div_transition) div_transition = create_bidirectional_transition(div, fade, {}, true);
    				div_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(galleryphotoselect.$$.fragment, local);
    			if (!div_transition) div_transition = create_bidirectional_transition(div, fade, {}, false);
    			div_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(galleryphotoselect);
    			if (detaching && div_transition) div_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$5.name,
    		type: "if",
    		source: "(142:0) {#if photo.open == true}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$c(ctx) {
    	let div1;
    	let t0;
    	let div0;
    	let t1;
    	let if_block1_anchor;
    	let current;
    	let if_block0 = /*showImages*/ ctx[3] !== true && create_if_block_1$2(ctx);
    	let each_value = /*selectedArray*/ ctx[4];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$3(get_each_context$3(ctx, each_value, i));
    	}

    	let if_block1 = /*photo*/ ctx[0].open == true && create_if_block$5(ctx);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			if (if_block0) if_block0.c();
    			t0 = space();
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t1 = space();
    			if (if_block1) if_block1.c();
    			if_block1_anchor = empty();
    			attr_dev(div0, "class", "grid svelte-smjo1f");
    			add_location(div0, file$c, 126, 4, 2745);
    			attr_dev(div1, "class", "row");
    			add_location(div1, file$c, 122, 0, 2602);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			if (if_block0) if_block0.m(div1, null);
    			append_dev(div1, t0);
    			append_dev(div1, div0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div0, null);
    			}

    			/*div0_binding*/ ctx[10](div0);
    			insert_dev(target, t1, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, if_block1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*showImages*/ ctx[3] !== true) {
    				if (if_block0) ; else {
    					if_block0 = create_if_block_1$2(ctx);
    					if_block0.c();
    					if_block0.m(div1, t0);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (dirty & /*gridItem, showImages, photo, selectedArray, countImages*/ 61) {
    				each_value = /*selectedArray*/ ctx[4];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$3(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$3(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div0, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (/*photo*/ ctx[0].open == true) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty & /*photo*/ 1) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block$5(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block1);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block1);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if (if_block0) if_block0.d();
    			destroy_each(each_blocks, detaching);
    			/*div0_binding*/ ctx[10](null);
    			if (detaching) detach_dev(t1);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(if_block1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$c.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$c($$self, $$props, $$invalidate) {
    	let { photoArray } = $$props;
    	let { photo = { open: false, array: "", index: "" } } = $$props;
    	let grid;
    	let gridItem;
    	let selectedArray = photoArray;
    	let imageCount = 0;
    	let showImages = false;

    	function countImages() {
    		imageCount += 1;

    		if (imageCount >= selectedArray.length) {
    			$$invalidate(3, showImages = true);
    		}
    	}

    	onMount(async () => {
    		sal$1({ threshold: 0.1 });

    		// let msnry = new Masonry( grid, {
    		//     // options
    		//     itemSelector: '.grid-item',
    		//     columnWidth: 500
    		// })
    		// // element argument can be a selector string
    		// //   for an individual element
    		// let msnryItem = new Masonry( '.grid', {
    		// // options
    		// })
    		let msnry;

    		imagesloaded(grid, function () {
    			// init Isotope after all images have loaded
    			if (showImages) {
    				msnry = new masonry(grid,
    				{
    						itemSelector: ".grid-item",
    						columnWidth: ".grid-item-preload",
    						percentPosition: true
    					});
    			}
    		});
    	});

    	const writable_props = ["photoArray", "photo"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<GalleryMasonry> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("GalleryMasonry", $$slots, []);

    	function div_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			$$invalidate(2, gridItem = $$value);
    		});
    	}

    	const click_handler = i => $$invalidate(0, photo = {
    		open: true,
    		array: selectedArray,
    		index: i
    	});

    	function div0_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			$$invalidate(1, grid = $$value);
    		});
    	}

    	const close_handler = () => $$invalidate(0, photo.open = false, photo);

    	$$self.$set = $$props => {
    		if ("photoArray" in $$props) $$invalidate(6, photoArray = $$props.photoArray);
    		if ("photo" in $$props) $$invalidate(0, photo = $$props.photo);
    	};

    	$$self.$capture_state = () => ({
    		sal: sal$1,
    		fade,
    		Masonry: masonry,
    		imagesLoaded: imagesloaded,
    		onMount,
    		GalleryPhotoSelect,
    		photoArray,
    		photo,
    		grid,
    		gridItem,
    		selectedArray,
    		imageCount,
    		showImages,
    		countImages
    	});

    	$$self.$inject_state = $$props => {
    		if ("photoArray" in $$props) $$invalidate(6, photoArray = $$props.photoArray);
    		if ("photo" in $$props) $$invalidate(0, photo = $$props.photo);
    		if ("grid" in $$props) $$invalidate(1, grid = $$props.grid);
    		if ("gridItem" in $$props) $$invalidate(2, gridItem = $$props.gridItem);
    		if ("selectedArray" in $$props) $$invalidate(4, selectedArray = $$props.selectedArray);
    		if ("imageCount" in $$props) imageCount = $$props.imageCount;
    		if ("showImages" in $$props) $$invalidate(3, showImages = $$props.showImages);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		photo,
    		grid,
    		gridItem,
    		showImages,
    		selectedArray,
    		countImages,
    		photoArray,
    		imageCount,
    		div_binding,
    		click_handler,
    		div0_binding,
    		close_handler
    	];
    }

    class GalleryMasonry extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$c, create_fragment$c, safe_not_equal, { photoArray: 6, photo: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "GalleryMasonry",
    			options,
    			id: create_fragment$c.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*photoArray*/ ctx[6] === undefined && !("photoArray" in props)) {
    			console.warn("<GalleryMasonry> was created without expected prop 'photoArray'");
    		}
    	}

    	get photoArray() {
    		throw new Error("<GalleryMasonry>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set photoArray(value) {
    		throw new Error("<GalleryMasonry>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get photo() {
    		throw new Error("<GalleryMasonry>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set photo(value) {
    		throw new Error("<GalleryMasonry>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/gallery/GalleryBanner.svelte generated by Svelte v3.21.0 */

    const { console: console_1$2 } = globals;
    const file$d = "src/components/gallery/GalleryBanner.svelte";

    // (92:0) {:else}
    function create_else_block$3(ctx) {
    	let current;

    	const gallerymasonry = new GalleryMasonry({
    			props: { photoArray: /*galleryMode*/ ctx[0] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(gallerymasonry.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(gallerymasonry, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const gallerymasonry_changes = {};
    			if (dirty & /*galleryMode*/ 1) gallerymasonry_changes.photoArray = /*galleryMode*/ ctx[0];
    			gallerymasonry.$set(gallerymasonry_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(gallerymasonry.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(gallerymasonry.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(gallerymasonry, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$3.name,
    		type: "else",
    		source: "(92:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (90:37) 
    function create_if_block_2$1(ctx) {
    	let current;

    	const gallerymasonry = new GalleryMasonry({
    			props: { photoArray: /*galleryMode*/ ctx[0] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(gallerymasonry.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(gallerymasonry, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const gallerymasonry_changes = {};
    			if (dirty & /*galleryMode*/ 1) gallerymasonry_changes.photoArray = /*galleryMode*/ ctx[0];
    			gallerymasonry.$set(gallerymasonry_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(gallerymasonry.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(gallerymasonry.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(gallerymasonry, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$1.name,
    		type: "if",
    		source: "(90:37) ",
    		ctx
    	});

    	return block;
    }

    // (88:37) 
    function create_if_block_1$3(ctx) {
    	let current;

    	const gallerymasonry = new GalleryMasonry({
    			props: { photoArray: /*galleryMode*/ ctx[0] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(gallerymasonry.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(gallerymasonry, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const gallerymasonry_changes = {};
    			if (dirty & /*galleryMode*/ 1) gallerymasonry_changes.photoArray = /*galleryMode*/ ctx[0];
    			gallerymasonry.$set(gallerymasonry_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(gallerymasonry.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(gallerymasonry.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(gallerymasonry, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$3.name,
    		type: "if",
    		source: "(88:37) ",
    		ctx
    	});

    	return block;
    }

    // (86:0) {#if galleryMode == portraitsArray}
    function create_if_block$6(ctx) {
    	let current;

    	const gallerymasonry = new GalleryMasonry({
    			props: { photoArray: /*galleryMode*/ ctx[0] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(gallerymasonry.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(gallerymasonry, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const gallerymasonry_changes = {};
    			if (dirty & /*galleryMode*/ 1) gallerymasonry_changes.photoArray = /*galleryMode*/ ctx[0];
    			gallerymasonry.$set(gallerymasonry_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(gallerymasonry.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(gallerymasonry.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(gallerymasonry, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$6.name,
    		type: "if",
    		source: "(86:0) {#if galleryMode == portraitsArray}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$d(ctx) {
    	let div1;
    	let h1;
    	let t1;
    	let div0;
    	let button0;
    	let t3;
    	let button1;
    	let t5;
    	let button2;
    	let t7;
    	let button3;
    	let t9;
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	let dispose;
    	const if_block_creators = [create_if_block$6, create_if_block_1$3, create_if_block_2$1, create_else_block$3];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*galleryMode*/ ctx[0] == /*portraitsArray*/ ctx[1]) return 0;
    		if (/*galleryMode*/ ctx[0] == /*familyArray*/ ctx[2]) return 1;
    		if (/*galleryMode*/ ctx[0] == /*eventsArray*/ ctx[3]) return 2;
    		return 3;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			h1 = element("h1");
    			h1.textContent = "Gallery";
    			t1 = space();
    			div0 = element("div");
    			button0 = element("button");
    			button0.textContent = "portraits";
    			t3 = space();
    			button1 = element("button");
    			button1.textContent = "family";
    			t5 = space();
    			button2 = element("button");
    			button2.textContent = "events";
    			t7 = space();
    			button3 = element("button");
    			button3.textContent = "misc";
    			t9 = space();
    			if_block.c();
    			if_block_anchor = empty();
    			attr_dev(h1, "class", "vollkorn sg-green svelte-ph42py");
    			add_location(h1, file$d, 76, 4, 1837);
    			attr_dev(button0, "class", "sg-green svelte-ph42py");
    			toggle_class(button0, "active", /*galleryMode*/ ctx[0] === /*portraitsArray*/ ctx[1]);
    			add_location(button0, file$d, 78, 8, 1933);
    			attr_dev(button1, "class", "sg-green svelte-ph42py");
    			toggle_class(button1, "active", /*galleryMode*/ ctx[0] === /*familyArray*/ ctx[2]);
    			add_location(button1, file$d, 79, 8, 2081);
    			attr_dev(button2, "class", "sg-green svelte-ph42py");
    			toggle_class(button2, "active", /*galleryMode*/ ctx[0] === /*eventsArray*/ ctx[3]);
    			add_location(button2, file$d, 80, 8, 2220);
    			attr_dev(button3, "class", "sg-green svelte-ph42py");
    			toggle_class(button3, "active", /*galleryMode*/ ctx[0] === /*miscArray*/ ctx[4]);
    			add_location(button3, file$d, 81, 8, 2359);
    			attr_dev(div0, "class", "gallery__filter montserrat svelte-ph42py");
    			add_location(div0, file$d, 77, 4, 1884);
    			attr_dev(div1, "class", "gallery svelte-ph42py");
    			add_location(div1, file$d, 75, 0, 1811);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, h1);
    			append_dev(div1, t1);
    			append_dev(div1, div0);
    			append_dev(div0, button0);
    			append_dev(div0, t3);
    			append_dev(div0, button1);
    			append_dev(div0, t5);
    			append_dev(div0, button2);
    			append_dev(div0, t7);
    			append_dev(div0, button3);
    			insert_dev(target, t9, anchor);
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    			if (remount) run_all(dispose);

    			dispose = [
    				listen_dev(button0, "click", /*click_handler*/ ctx[5], false, false, false),
    				listen_dev(button1, "click", /*click_handler_1*/ ctx[6], false, false, false),
    				listen_dev(button2, "click", /*click_handler_2*/ ctx[7], false, false, false),
    				listen_dev(button3, "click", /*click_handler_3*/ ctx[8], false, false, false)
    			];
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*galleryMode, portraitsArray*/ 3) {
    				toggle_class(button0, "active", /*galleryMode*/ ctx[0] === /*portraitsArray*/ ctx[1]);
    			}

    			if (dirty & /*galleryMode, familyArray*/ 5) {
    				toggle_class(button1, "active", /*galleryMode*/ ctx[0] === /*familyArray*/ ctx[2]);
    			}

    			if (dirty & /*galleryMode, eventsArray*/ 9) {
    				toggle_class(button2, "active", /*galleryMode*/ ctx[0] === /*eventsArray*/ ctx[3]);
    			}

    			if (dirty & /*galleryMode, miscArray*/ 17) {
    				toggle_class(button3, "active", /*galleryMode*/ ctx[0] === /*miscArray*/ ctx[4]);
    			}

    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if (detaching) detach_dev(t9);
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$d.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$d($$self, $$props, $$invalidate) {
    	let portraitsArray = [];
    	let familyArray = [];
    	let eventsArray = [];
    	let miscArray = [];
    	let { galleryMode = [] } = $$props;

    	onMount(async () => {
    		API_GET_PORTRAITS().then(response => {
    			$$invalidate(1, portraitsArray = response);
    			$$invalidate(0, galleryMode = portraitsArray);
    		});

    		API_GET_FAMILY().then(response => {
    			$$invalidate(2, familyArray = response);
    		});

    		API_GET_EVENTS().then(response => {
    			$$invalidate(3, eventsArray = response);
    		});

    		API_GET_MISC().then(response => {
    			$$invalidate(4, miscArray = response);
    			return (miscArray);
    		}).catch(error => {
    			console.log(error);
    		});
    	});

    	const writable_props = ["galleryMode"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$2.warn(`<GalleryBanner> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("GalleryBanner", $$slots, []);
    	const click_handler = () => $$invalidate(0, galleryMode = portraitsArray);
    	const click_handler_1 = () => $$invalidate(0, galleryMode = familyArray);
    	const click_handler_2 = () => $$invalidate(0, galleryMode = eventsArray);
    	const click_handler_3 = () => $$invalidate(0, galleryMode = miscArray);

    	$$self.$set = $$props => {
    		if ("galleryMode" in $$props) $$invalidate(0, galleryMode = $$props.galleryMode);
    	};

    	$$self.$capture_state = () => ({
    		API_GET_PORTRAITS,
    		API_GET_FAMILY,
    		API_GET_EVENTS,
    		API_GET_MISC,
    		GalleryMasonry,
    		axios: axios$1,
    		onMount,
    		portraitsArray,
    		familyArray,
    		eventsArray,
    		miscArray,
    		galleryMode
    	});

    	$$self.$inject_state = $$props => {
    		if ("portraitsArray" in $$props) $$invalidate(1, portraitsArray = $$props.portraitsArray);
    		if ("familyArray" in $$props) $$invalidate(2, familyArray = $$props.familyArray);
    		if ("eventsArray" in $$props) $$invalidate(3, eventsArray = $$props.eventsArray);
    		if ("miscArray" in $$props) $$invalidate(4, miscArray = $$props.miscArray);
    		if ("galleryMode" in $$props) $$invalidate(0, galleryMode = $$props.galleryMode);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		galleryMode,
    		portraitsArray,
    		familyArray,
    		eventsArray,
    		miscArray,
    		click_handler,
    		click_handler_1,
    		click_handler_2,
    		click_handler_3
    	];
    }

    class GalleryBanner extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$d, create_fragment$d, safe_not_equal, { galleryMode: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "GalleryBanner",
    			options,
    			id: create_fragment$d.name
    		});
    	}

    	get galleryMode() {
    		throw new Error("<GalleryBanner>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set galleryMode(value) {
    		throw new Error("<GalleryBanner>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/gallery/Gallery.svelte generated by Svelte v3.21.0 */

    function create_fragment$e(ctx) {
    	let current;
    	const gallerybanner = new GalleryBanner({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(gallerybanner.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(gallerybanner, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(gallerybanner.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(gallerybanner.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(gallerybanner, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$e.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$e($$self, $$props, $$invalidate) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Gallery> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Gallery", $$slots, []);
    	$$self.$capture_state = () => ({ GalleryBanner });
    	return [];
    }

    class Gallery extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$e, create_fragment$e, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Gallery",
    			options,
    			id: create_fragment$e.name
    		});
    	}
    }

    /* src/components/videography/VideoBlade.svelte generated by Svelte v3.21.0 */

    const file$e = "src/components/videography/VideoBlade.svelte";
    const get_text_slot_changes = dirty => ({});
    const get_text_slot_context = ctx => ({});
    const get_title_slot_changes = dirty => ({});
    const get_title_slot_context = ctx => ({});
    const get_video_slot_changes = dirty => ({});
    const get_video_slot_context = ctx => ({});

    function create_fragment$f(ctx) {
    	let div3;
    	let div0;
    	let t0;
    	let div2;
    	let div1;
    	let t1;
    	let current;
    	const video_slot_template = /*$$slots*/ ctx[1].video;
    	const video_slot = create_slot(video_slot_template, ctx, /*$$scope*/ ctx[0], get_video_slot_context);
    	const title_slot_template = /*$$slots*/ ctx[1].title;
    	const title_slot = create_slot(title_slot_template, ctx, /*$$scope*/ ctx[0], get_title_slot_context);
    	const text_slot_template = /*$$slots*/ ctx[1].text;
    	const text_slot = create_slot(text_slot_template, ctx, /*$$scope*/ ctx[0], get_text_slot_context);

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			div0 = element("div");
    			if (video_slot) video_slot.c();
    			t0 = space();
    			div2 = element("div");
    			div1 = element("div");
    			if (title_slot) title_slot.c();
    			t1 = space();
    			if (text_slot) text_slot.c();
    			attr_dev(div0, "class", "sg-video-blade__video svelte-wj0y6l");
    			add_location(div0, file$e, 34, 4, 920);
    			attr_dev(div1, "class", "sg-video-blade__description__content svelte-wj0y6l");
    			add_location(div1, file$e, 36, 8, 1042);
    			attr_dev(div2, "class", "sg-video-blade__description svelte-wj0y6l");
    			add_location(div2, file$e, 35, 4, 992);
    			attr_dev(div3, "class", "sg-video-blade sg-green svelte-wj0y6l");
    			add_location(div3, file$e, 33, 0, 878);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div0);

    			if (video_slot) {
    				video_slot.m(div0, null);
    			}

    			append_dev(div3, t0);
    			append_dev(div3, div2);
    			append_dev(div2, div1);

    			if (title_slot) {
    				title_slot.m(div1, null);
    			}

    			append_dev(div1, t1);

    			if (text_slot) {
    				text_slot.m(div1, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (video_slot) {
    				if (video_slot.p && dirty & /*$$scope*/ 1) {
    					video_slot.p(get_slot_context(video_slot_template, ctx, /*$$scope*/ ctx[0], get_video_slot_context), get_slot_changes(video_slot_template, /*$$scope*/ ctx[0], dirty, get_video_slot_changes));
    				}
    			}

    			if (title_slot) {
    				if (title_slot.p && dirty & /*$$scope*/ 1) {
    					title_slot.p(get_slot_context(title_slot_template, ctx, /*$$scope*/ ctx[0], get_title_slot_context), get_slot_changes(title_slot_template, /*$$scope*/ ctx[0], dirty, get_title_slot_changes));
    				}
    			}

    			if (text_slot) {
    				if (text_slot.p && dirty & /*$$scope*/ 1) {
    					text_slot.p(get_slot_context(text_slot_template, ctx, /*$$scope*/ ctx[0], get_text_slot_context), get_slot_changes(text_slot_template, /*$$scope*/ ctx[0], dirty, get_text_slot_changes));
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(video_slot, local);
    			transition_in(title_slot, local);
    			transition_in(text_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(video_slot, local);
    			transition_out(title_slot, local);
    			transition_out(text_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    			if (video_slot) video_slot.d(detaching);
    			if (title_slot) title_slot.d(detaching);
    			if (text_slot) text_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$f.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$f($$self, $$props, $$invalidate) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<VideoBlade> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("VideoBlade", $$slots, ['video','title','text']);

    	$$self.$set = $$props => {
    		if ("$$scope" in $$props) $$invalidate(0, $$scope = $$props.$$scope);
    	};

    	return [$$scope, $$slots];
    }

    class VideoBlade extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$f, create_fragment$f, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "VideoBlade",
    			options,
    			id: create_fragment$f.name
    		});
    	}
    }

    /* src/components/videography/VideoList.svelte generated by Svelte v3.21.0 */
    const file$f = "src/components/videography/VideoList.svelte";

    // (52:8) <span slot="video">
    function create_video_slot_4(ctx) {
    	let span;
    	let iframe;
    	let iframe_src_value;

    	const block = {
    		c: function create() {
    			span = element("span");
    			iframe = element("iframe");
    			attr_dev(iframe, "width", "560");
    			attr_dev(iframe, "height", "315");
    			if (iframe.src !== (iframe_src_value = "https://www.youtube.com/embed/oKjTc_AzUVI")) attr_dev(iframe, "src", iframe_src_value);
    			attr_dev(iframe, "frameborder", "0");
    			attr_dev(iframe, "allow", "accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture");
    			iframe.allowFullscreen = true;
    			attr_dev(iframe, "class", "svelte-nppq0o");
    			add_location(iframe, file$f, 51, 27, 1199);
    			attr_dev(span, "slot", "video");
    			add_location(span, file$f, 51, 8, 1180);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, iframe);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_video_slot_4.name,
    		type: "slot",
    		source: "(52:8) <span slot=\\\"video\\\">",
    		ctx
    	});

    	return block;
    }

    // (53:8) <span slot="title">
    function create_title_slot_4(ctx) {
    	let span;
    	let h2;

    	const block = {
    		c: function create() {
    			span = element("span");
    			h2 = element("h2");
    			h2.textContent = "| Camp Kesem |";
    			attr_dev(h2, "class", "svelte-nppq0o");
    			add_location(h2, file$f, 52, 27, 1436);
    			attr_dev(span, "slot", "title");
    			add_location(span, file$f, 52, 8, 1417);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, h2);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_title_slot_4.name,
    		type: "slot",
    		source: "(53:8) <span slot=\\\"title\\\">",
    		ctx
    	});

    	return block;
    }

    // (54:8) <span slot="text">
    function create_text_slot_4(ctx) {
    	let span;
    	let p;
    	let t0;
    	let a;

    	const block = {
    		c: function create() {
    			span = element("span");
    			p = element("p");
    			t0 = text("Thank you to Camp Kesem at University of Minnesota for letting me capture the magic of camp. If you didn’t know, Camp Kesem is a free camp for kids who have closely experienced cancer in the family. If you feel so inclined, please follow the link to learn more and/or donate. ");
    			a = element("a");
    			a.textContent = "Learn more";
    			attr_dev(a, "target", "_blank");
    			attr_dev(a, "href", "https://www.campkesem.org/find-a-camp/camp-kesem-at-university-of-minnesota");
    			attr_dev(a, "class", "svelte-nppq0o");
    			add_location(a, file$f, 53, 305, 1772);
    			attr_dev(p, "class", "svelte-nppq0o");
    			add_location(p, file$f, 53, 26, 1493);
    			attr_dev(span, "slot", "text");
    			add_location(span, file$f, 53, 8, 1475);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, p);
    			append_dev(p, t0);
    			append_dev(p, a);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_text_slot_4.name,
    		type: "slot",
    		source: "(54:8) <span slot=\\\"text\\\">",
    		ctx
    	});

    	return block;
    }

    // (51:4) <VideoBlade>
    function create_default_slot_4(ctx) {
    	let t0;
    	let t1;

    	const block = {
    		c: function create() {
    			t0 = space();
    			t1 = space();
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, t1, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(t1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_4.name,
    		type: "slot",
    		source: "(51:4) <VideoBlade>",
    		ctx
    	});

    	return block;
    }

    // (58:8) <span slot="video">
    function create_video_slot_3(ctx) {
    	let span;
    	let iframe;
    	let iframe_src_value;

    	const block = {
    		c: function create() {
    			span = element("span");
    			iframe = element("iframe");
    			attr_dev(iframe, "width", "560");
    			attr_dev(iframe, "height", "315");
    			if (iframe.src !== (iframe_src_value = "https://www.youtube.com/embed/ZGn8UYaJrFk")) attr_dev(iframe, "src", iframe_src_value);
    			attr_dev(iframe, "frameborder", "0");
    			attr_dev(iframe, "allow", "accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture");
    			iframe.allowFullscreen = true;
    			attr_dev(iframe, "class", "svelte-nppq0o");
    			add_location(iframe, file$f, 57, 27, 1963);
    			attr_dev(span, "slot", "video");
    			add_location(span, file$f, 57, 8, 1944);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, iframe);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_video_slot_3.name,
    		type: "slot",
    		source: "(58:8) <span slot=\\\"video\\\">",
    		ctx
    	});

    	return block;
    }

    // (59:8) <span slot="title">
    function create_title_slot_3(ctx) {
    	let span;
    	let h2;

    	const block = {
    		c: function create() {
    			span = element("span");
    			h2 = element("h2");
    			h2.textContent = "| Hawaii 2019 |";
    			attr_dev(h2, "class", "svelte-nppq0o");
    			add_location(h2, file$f, 58, 27, 2200);
    			attr_dev(span, "slot", "title");
    			add_location(span, file$f, 58, 8, 2181);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, h2);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_title_slot_3.name,
    		type: "slot",
    		source: "(59:8) <span slot=\\\"title\\\">",
    		ctx
    	});

    	return block;
    }

    // (60:8) <span slot="text">
    function create_text_slot_3(ctx) {
    	let span;
    	let p;

    	const block = {
    		c: function create() {
    			span = element("span");
    			p = element("p");
    			p.textContent = "April 27th-May 4th I was fotrunate enough to join my mom and her boyfriend jayson on a trip to Kauai, HI. I have always felt that I was an island beach bum in a past life, so I finally got to live out my dreams. Travel has always been a priority to me, and I’m so lucky to have amazing opportunities like these.";
    			attr_dev(p, "class", "svelte-nppq0o");
    			add_location(p, file$f, 59, 26, 2258);
    			attr_dev(span, "slot", "text");
    			add_location(span, file$f, 59, 8, 2240);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, p);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_text_slot_3.name,
    		type: "slot",
    		source: "(60:8) <span slot=\\\"text\\\">",
    		ctx
    	});

    	return block;
    }

    // (57:4) <VideoBlade>
    function create_default_slot_3(ctx) {
    	let t0;
    	let t1;

    	const block = {
    		c: function create() {
    			t0 = space();
    			t1 = space();
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, t1, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(t1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_3.name,
    		type: "slot",
    		source: "(57:4) <VideoBlade>",
    		ctx
    	});

    	return block;
    }

    // (63:8) <span slot="video">
    function create_video_slot_2(ctx) {
    	let span;
    	let iframe;
    	let iframe_src_value;

    	const block = {
    		c: function create() {
    			span = element("span");
    			iframe = element("iframe");
    			attr_dev(iframe, "width", "560");
    			attr_dev(iframe, "height", "315");
    			if (iframe.src !== (iframe_src_value = "https://www.youtube.com/embed/x8WQ0k9jbrI")) attr_dev(iframe, "src", iframe_src_value);
    			attr_dev(iframe, "frameborder", "0");
    			attr_dev(iframe, "allow", "accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture");
    			iframe.allowFullscreen = true;
    			attr_dev(iframe, "class", "svelte-nppq0o");
    			add_location(iframe, file$f, 62, 27, 2646);
    			attr_dev(span, "slot", "video");
    			add_location(span, file$f, 62, 8, 2627);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, iframe);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_video_slot_2.name,
    		type: "slot",
    		source: "(63:8) <span slot=\\\"video\\\">",
    		ctx
    	});

    	return block;
    }

    // (64:8) <span slot="title">
    function create_title_slot_2(ctx) {
    	let span;
    	let h2;

    	const block = {
    		c: function create() {
    			span = element("span");
    			h2 = element("h2");
    			h2.textContent = "| Southeast Asia 2018 |";
    			attr_dev(h2, "class", "svelte-nppq0o");
    			add_location(h2, file$f, 63, 27, 2883);
    			attr_dev(span, "slot", "title");
    			add_location(span, file$f, 63, 8, 2864);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, h2);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_title_slot_2.name,
    		type: "slot",
    		source: "(64:8) <span slot=\\\"title\\\">",
    		ctx
    	});

    	return block;
    }

    // (65:8) <span slot="text">
    function create_text_slot_2(ctx) {
    	let span;
    	let p;

    	const block = {
    		c: function create() {
    			span = element("span");
    			p = element("p");
    			p.textContent = "Yet another lucky opportunity sent my way. My mom and I accompanied the UW-Eau Claire Blugold Marching Band(which my sister, Peyton, was a part of) on a 3-week cruise around asia including the countries of Singapore, Malaysia, Thailand, and Indonesia. My first journey outside of the United States.";
    			attr_dev(p, "class", "svelte-nppq0o");
    			add_location(p, file$f, 64, 26, 2949);
    			attr_dev(span, "slot", "text");
    			add_location(span, file$f, 64, 8, 2931);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, p);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_text_slot_2.name,
    		type: "slot",
    		source: "(65:8) <span slot=\\\"text\\\">",
    		ctx
    	});

    	return block;
    }

    // (62:4) <VideoBlade>
    function create_default_slot_2(ctx) {
    	let t0;
    	let t1;

    	const block = {
    		c: function create() {
    			t0 = space();
    			t1 = space();
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, t1, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(t1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2.name,
    		type: "slot",
    		source: "(62:4) <VideoBlade>",
    		ctx
    	});

    	return block;
    }

    // (69:8) <span slot="video">
    function create_video_slot_1(ctx) {
    	let span;
    	let iframe;
    	let iframe_src_value;

    	const block = {
    		c: function create() {
    			span = element("span");
    			iframe = element("iframe");
    			attr_dev(iframe, "width", "560");
    			attr_dev(iframe, "height", "315");
    			if (iframe.src !== (iframe_src_value = "https://www.youtube.com/embed/XDjvLAf8sIA")) attr_dev(iframe, "src", iframe_src_value);
    			attr_dev(iframe, "frameborder", "0");
    			attr_dev(iframe, "allow", "accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture");
    			iframe.allowFullscreen = true;
    			attr_dev(iframe, "class", "svelte-nppq0o");
    			add_location(iframe, file$f, 68, 27, 3325);
    			attr_dev(span, "slot", "video");
    			add_location(span, file$f, 68, 8, 3306);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, iframe);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_video_slot_1.name,
    		type: "slot",
    		source: "(69:8) <span slot=\\\"video\\\">",
    		ctx
    	});

    	return block;
    }

    // (70:8) <span slot="title">
    function create_title_slot_1(ctx) {
    	let span;
    	let h2;

    	const block = {
    		c: function create() {
    			span = element("span");
    			h2 = element("h2");
    			h2.textContent = "| Spring Break 2019 |";
    			attr_dev(h2, "class", "svelte-nppq0o");
    			add_location(h2, file$f, 69, 27, 3562);
    			attr_dev(span, "slot", "title");
    			add_location(span, file$f, 69, 8, 3543);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, h2);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_title_slot_1.name,
    		type: "slot",
    		source: "(70:8) <span slot=\\\"title\\\">",
    		ctx
    	});

    	return block;
    }

    // (71:8) <span slot="text">
    function create_text_slot_1(ctx) {
    	let span;
    	let p;

    	const block = {
    		c: function create() {
    			span = element("span");
    			p = element("p");
    			p.textContent = "After originally planning a roadtrip to Colorado, my roommates and I decided to save money by roadtripping around Eastern Wisconsin from Egg Harbor to Chicago  instead. Although many things didn’t go as planned, I would say it was a very memorable trip with some of my favorite people.";
    			attr_dev(p, "class", "svelte-nppq0o");
    			add_location(p, file$f, 70, 26, 3626);
    			attr_dev(span, "slot", "text");
    			add_location(span, file$f, 70, 8, 3608);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, p);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_text_slot_1.name,
    		type: "slot",
    		source: "(71:8) <span slot=\\\"text\\\">",
    		ctx
    	});

    	return block;
    }

    // (68:4) <VideoBlade>
    function create_default_slot_1(ctx) {
    	let t0;
    	let t1;

    	const block = {
    		c: function create() {
    			t0 = space();
    			t1 = space();
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, t1, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(t1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1.name,
    		type: "slot",
    		source: "(68:4) <VideoBlade>",
    		ctx
    	});

    	return block;
    }

    // (75:8) <span slot="video">
    function create_video_slot(ctx) {
    	let span;
    	let iframe;
    	let iframe_src_value;

    	const block = {
    		c: function create() {
    			span = element("span");
    			iframe = element("iframe");
    			attr_dev(iframe, "width", "560");
    			attr_dev(iframe, "height", "315");
    			if (iframe.src !== (iframe_src_value = "https://www.youtube.com/embed/iv_SK7mlDms")) attr_dev(iframe, "src", iframe_src_value);
    			attr_dev(iframe, "frameborder", "0");
    			attr_dev(iframe, "allow", "accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture");
    			iframe.allowFullscreen = true;
    			attr_dev(iframe, "class", "svelte-nppq0o");
    			add_location(iframe, file$f, 74, 27, 3989);
    			attr_dev(span, "slot", "video");
    			add_location(span, file$f, 74, 8, 3970);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, iframe);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_video_slot.name,
    		type: "slot",
    		source: "(75:8) <span slot=\\\"video\\\">",
    		ctx
    	});

    	return block;
    }

    // (76:8) <span slot="title">
    function create_title_slot(ctx) {
    	let span;
    	let h2;

    	const block = {
    		c: function create() {
    			span = element("span");
    			h2 = element("h2");
    			h2.textContent = "| Washington 2019 |";
    			attr_dev(h2, "class", "svelte-nppq0o");
    			add_location(h2, file$f, 75, 27, 4226);
    			attr_dev(span, "slot", "title");
    			add_location(span, file$f, 75, 8, 4207);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, h2);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_title_slot.name,
    		type: "slot",
    		source: "(76:8) <span slot=\\\"title\\\">",
    		ctx
    	});

    	return block;
    }

    // (77:8) <span slot="text">
    function create_text_slot(ctx) {
    	let span;
    	let p;

    	const block = {
    		c: function create() {
    			span = element("span");
    			p = element("p");
    			p.textContent = "Over winter break my sister and I traveled to Seattle, WA for the second time. I instantly grew a love for Washington and its scenic geography excluding the slightly gloomy weather. Right between the expansive coast and awe-inspiring mountainscapes, Washington holds a special place in my heart, and I can’t wait to return again someday soon.";
    			attr_dev(p, "class", "svelte-nppq0o");
    			add_location(p, file$f, 76, 26, 4288);
    			attr_dev(span, "slot", "text");
    			add_location(span, file$f, 76, 8, 4270);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, p);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_text_slot.name,
    		type: "slot",
    		source: "(77:8) <span slot=\\\"text\\\">",
    		ctx
    	});

    	return block;
    }

    // (74:4) <VideoBlade>
    function create_default_slot$1(ctx) {
    	let t0;
    	let t1;

    	const block = {
    		c: function create() {
    			t0 = space();
    			t1 = space();
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, t1, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(t1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$1.name,
    		type: "slot",
    		source: "(74:4) <VideoBlade>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$g(ctx) {
    	let div0;
    	let h2;
    	let t1;
    	let div1;
    	let t2;
    	let t3;
    	let t4;
    	let t5;
    	let current;

    	const videoblade0 = new VideoBlade({
    			props: {
    				$$slots: {
    					default: [create_default_slot_4],
    					text: [create_text_slot_4],
    					title: [create_title_slot_4],
    					video: [create_video_slot_4]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const videoblade1 = new VideoBlade({
    			props: {
    				$$slots: {
    					default: [create_default_slot_3],
    					text: [create_text_slot_3],
    					title: [create_title_slot_3],
    					video: [create_video_slot_3]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const videoblade2 = new VideoBlade({
    			props: {
    				$$slots: {
    					default: [create_default_slot_2],
    					text: [create_text_slot_2],
    					title: [create_title_slot_2],
    					video: [create_video_slot_2]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const videoblade3 = new VideoBlade({
    			props: {
    				$$slots: {
    					default: [create_default_slot_1],
    					text: [create_text_slot_1],
    					title: [create_title_slot_1],
    					video: [create_video_slot_1]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const videoblade4 = new VideoBlade({
    			props: {
    				$$slots: {
    					default: [create_default_slot$1],
    					text: [create_text_slot],
    					title: [create_title_slot],
    					video: [create_video_slot]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			h2 = element("h2");
    			h2.textContent = "My recent work";
    			t1 = space();
    			div1 = element("div");
    			create_component(videoblade0.$$.fragment);
    			t2 = space();
    			create_component(videoblade1.$$.fragment);
    			t3 = space();
    			create_component(videoblade2.$$.fragment);
    			t4 = space();
    			create_component(videoblade3.$$.fragment);
    			t5 = space();
    			create_component(videoblade4.$$.fragment);
    			attr_dev(h2, "class", "svelte-nppq0o");
    			add_location(h2, file$f, 47, 4, 1096);
    			attr_dev(div0, "class", "sg-video-list-header vollkorn sg-green svelte-nppq0o");
    			add_location(div0, file$f, 46, 0, 1039);
    			attr_dev(div1, "class", "sg-video-list svelte-nppq0o");
    			add_location(div1, file$f, 49, 0, 1127);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			append_dev(div0, h2);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div1, anchor);
    			mount_component(videoblade0, div1, null);
    			append_dev(div1, t2);
    			mount_component(videoblade1, div1, null);
    			append_dev(div1, t3);
    			mount_component(videoblade2, div1, null);
    			append_dev(div1, t4);
    			mount_component(videoblade3, div1, null);
    			append_dev(div1, t5);
    			mount_component(videoblade4, div1, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const videoblade0_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				videoblade0_changes.$$scope = { dirty, ctx };
    			}

    			videoblade0.$set(videoblade0_changes);
    			const videoblade1_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				videoblade1_changes.$$scope = { dirty, ctx };
    			}

    			videoblade1.$set(videoblade1_changes);
    			const videoblade2_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				videoblade2_changes.$$scope = { dirty, ctx };
    			}

    			videoblade2.$set(videoblade2_changes);
    			const videoblade3_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				videoblade3_changes.$$scope = { dirty, ctx };
    			}

    			videoblade3.$set(videoblade3_changes);
    			const videoblade4_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				videoblade4_changes.$$scope = { dirty, ctx };
    			}

    			videoblade4.$set(videoblade4_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(videoblade0.$$.fragment, local);
    			transition_in(videoblade1.$$.fragment, local);
    			transition_in(videoblade2.$$.fragment, local);
    			transition_in(videoblade3.$$.fragment, local);
    			transition_in(videoblade4.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(videoblade0.$$.fragment, local);
    			transition_out(videoblade1.$$.fragment, local);
    			transition_out(videoblade2.$$.fragment, local);
    			transition_out(videoblade3.$$.fragment, local);
    			transition_out(videoblade4.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div1);
    			destroy_component(videoblade0);
    			destroy_component(videoblade1);
    			destroy_component(videoblade2);
    			destroy_component(videoblade3);
    			destroy_component(videoblade4);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$g.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$g($$self, $$props, $$invalidate) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<VideoList> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("VideoList", $$slots, []);
    	$$self.$capture_state = () => ({ VideoBlade });
    	return [];
    }

    class VideoList extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$g, create_fragment$g, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "VideoList",
    			options,
    			id: create_fragment$g.name
    		});
    	}
    }

    /* src/components/videography/Videography.svelte generated by Svelte v3.21.0 */
    const file$g = "src/components/videography/Videography.svelte";

    // (31:0) <PageBanner>
    function create_default_slot$2(ctx) {
    	let h1;

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			h1.textContent = "Videography";
    			add_location(h1, file$g, 31, 8, 2037);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$2.name,
    		type: "slot",
    		source: "(31:0) <PageBanner>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$h(ctx) {
    	let div;
    	let iframe;
    	let iframe_src_value;
    	let t0;
    	let t1;
    	let t2;
    	let current;

    	const pagebanner = new PageBanner({
    			props: {
    				$$slots: { default: [create_default_slot$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const videolist = new VideoList({ $$inline: true });
    	const footer = new Footer({ $$inline: true });

    	const block = {
    		c: function create() {
    			div = element("div");
    			iframe = element("iframe");
    			t0 = space();
    			create_component(pagebanner.$$.fragment);
    			t1 = space();
    			create_component(videolist.$$.fragment);
    			t2 = space();
    			create_component(footer.$$.fragment);
    			if (iframe.src !== (iframe_src_value = "https://player.vimeo.com/video/370927333?autoplay=1&loop=1&title=0&byline=0&portrait=0")) attr_dev(iframe, "src", iframe_src_value);
    			attr_dev(iframe, "width", "640");
    			attr_dev(iframe, "height", "360");
    			attr_dev(iframe, "frameborder", "0");
    			attr_dev(iframe, "allow", "autoplay; fullscreen");
    			iframe.allowFullscreen = true;
    			attr_dev(iframe, "class", "svelte-1730vqj");
    			add_location(iframe, file$g, 29, 0, 1815);
    			attr_dev(div, "class", "video-background svelte-1730vqj");
    			add_location(div, file$g, 27, 0, 1466);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, iframe);
    			append_dev(div, t0);
    			mount_component(pagebanner, div, null);
    			insert_dev(target, t1, anchor);
    			mount_component(videolist, target, anchor);
    			insert_dev(target, t2, anchor);
    			mount_component(footer, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const pagebanner_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				pagebanner_changes.$$scope = { dirty, ctx };
    			}

    			pagebanner.$set(pagebanner_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(pagebanner.$$.fragment, local);
    			transition_in(videolist.$$.fragment, local);
    			transition_in(footer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(pagebanner.$$.fragment, local);
    			transition_out(videolist.$$.fragment, local);
    			transition_out(footer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(pagebanner);
    			if (detaching) detach_dev(t1);
    			destroy_component(videolist, detaching);
    			if (detaching) detach_dev(t2);
    			destroy_component(footer, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$h.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$h($$self, $$props, $$invalidate) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Videography> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Videography", $$slots, []);
    	$$self.$capture_state = () => ({ PageBanner, VideoList, Footer });
    	return [];
    }

    class Videography extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$h, create_fragment$h, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Videography",
    			options,
    			id: create_fragment$h.name
    		});
    	}
    }

    var cart = writable("");

    /* src/components/store/preset/preset-description.svelte generated by Svelte v3.21.0 */
    const file$h = "src/components/store/preset/preset-description.svelte";

    function get_each_context$4(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[8] = list[i];
    	return child_ctx;
    }

    // (94:8) {#each bullets as bullet}
    function create_each_block$4(ctx) {
    	let p;
    	let t0;
    	let t1_value = /*bullet*/ ctx[8] + "";
    	let t1;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t0 = text("~ ");
    			t1 = text(t1_value);
    			add_location(p, file$h, 94, 12, 2239);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t0);
    			append_dev(p, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*bullets*/ 8 && t1_value !== (t1_value = /*bullet*/ ctx[8] + "")) set_data_dev(t1, t1_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$4.name,
    		type: "each",
    		source: "(94:8) {#each bullets as bullet}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$i(ctx) {
    	let div1;
    	let h1;
    	let t0;
    	let t1;
    	let h2;
    	let t2;
    	let t3_value = /*amount*/ ctx[2] / 100 + "";
    	let t3;
    	let t4;
    	let p;
    	let t5;
    	let t6;
    	let div0;
    	let t7;
    	let button;
    	let t8;
    	let button_class_value;
    	let dispose;
    	let each_value = /*bullets*/ ctx[3];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$4(get_each_context$4(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			h1 = element("h1");
    			t0 = text(/*name*/ ctx[0]);
    			t1 = space();
    			h2 = element("h2");
    			t2 = text("$");
    			t3 = text(t3_value);
    			t4 = space();
    			p = element("p");
    			t5 = text(/*description*/ ctx[1]);
    			t6 = space();
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t7 = space();
    			button = element("button");
    			t8 = text(/*buttonText*/ ctx[5]);
    			attr_dev(h1, "class", "title p-marker svelte-s4kz8s");
    			add_location(h1, file$h, 89, 4, 2015);
    			attr_dev(h2, "class", "price alegreya svelte-s4kz8s");
    			add_location(h2, file$h, 90, 4, 2058);
    			attr_dev(p, "class", "description alegreya svelte-s4kz8s");
    			add_location(p, file$h, 91, 4, 2108);
    			attr_dev(div0, "class", "bullets alegreya svelte-s4kz8s");
    			add_location(div0, file$h, 92, 4, 2162);
    			attr_dev(button, "class", button_class_value = "" + ((/*isInCart*/ ctx[4] ? "remove" : "add") + " button alegreya" + " svelte-s4kz8s"));
    			add_location(button, file$h, 97, 4, 2288);
    			attr_dev(div1, "class", "container sg-green svelte-s4kz8s");
    			add_location(div1, file$h, 88, 0, 1978);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, h1);
    			append_dev(h1, t0);
    			append_dev(div1, t1);
    			append_dev(div1, h2);
    			append_dev(h2, t2);
    			append_dev(h2, t3);
    			append_dev(div1, t4);
    			append_dev(div1, p);
    			append_dev(p, t5);
    			append_dev(div1, t6);
    			append_dev(div1, div0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div0, null);
    			}

    			append_dev(div1, t7);
    			append_dev(div1, button);
    			append_dev(button, t8);
    			if (remount) dispose();
    			dispose = listen_dev(button, "click", /*toggleAdd*/ ctx[6], false, false, false);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*name*/ 1) set_data_dev(t0, /*name*/ ctx[0]);
    			if (dirty & /*amount*/ 4 && t3_value !== (t3_value = /*amount*/ ctx[2] / 100 + "")) set_data_dev(t3, t3_value);
    			if (dirty & /*description*/ 2) set_data_dev(t5, /*description*/ ctx[1]);

    			if (dirty & /*bullets*/ 8) {
    				each_value = /*bullets*/ ctx[3];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$4(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$4(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div0, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*buttonText*/ 32) set_data_dev(t8, /*buttonText*/ ctx[5]);

    			if (dirty & /*isInCart*/ 16 && button_class_value !== (button_class_value = "" + ((/*isInCart*/ ctx[4] ? "remove" : "add") + " button alegreya" + " svelte-s4kz8s"))) {
    				attr_dev(button, "class", button_class_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			destroy_each(each_blocks, detaching);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$i.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$i($$self, $$props, $$invalidate) {
    	let { name } = $$props,
    		{ description } = $$props,
    		{ amount } = $$props,
    		{ bullets } = $$props,
    		{ images } = $$props;

    	let isInCart = false;

    	const toggleAdd = () => {
    		let cartItem = {
    			name,
    			amount,
    			description,
    			currency: "usd",
    			quantity: 1,
    			images: images.main
    		};

    		$$invalidate(4, isInCart = !isInCart);

    		if (isInCart) {
    			if (cartItem.name === "preset package") {
    				cart.update(cart => [cartItem]);
    			} else {
    				cart.update(cart => [...cart, cartItem]);
    			}
    		} else {
    			cart.update(cart => cart.filter(item => item.name !== cartItem.name));
    		}
    	};

    	const writable_props = ["name", "description", "amount", "bullets", "images"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Preset_description> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Preset_description", $$slots, []);

    	$$self.$set = $$props => {
    		if ("name" in $$props) $$invalidate(0, name = $$props.name);
    		if ("description" in $$props) $$invalidate(1, description = $$props.description);
    		if ("amount" in $$props) $$invalidate(2, amount = $$props.amount);
    		if ("bullets" in $$props) $$invalidate(3, bullets = $$props.bullets);
    		if ("images" in $$props) $$invalidate(7, images = $$props.images);
    	};

    	$$self.$capture_state = () => ({
    		cart,
    		name,
    		description,
    		amount,
    		bullets,
    		images,
    		isInCart,
    		toggleAdd,
    		buttonText
    	});

    	$$self.$inject_state = $$props => {
    		if ("name" in $$props) $$invalidate(0, name = $$props.name);
    		if ("description" in $$props) $$invalidate(1, description = $$props.description);
    		if ("amount" in $$props) $$invalidate(2, amount = $$props.amount);
    		if ("bullets" in $$props) $$invalidate(3, bullets = $$props.bullets);
    		if ("images" in $$props) $$invalidate(7, images = $$props.images);
    		if ("isInCart" in $$props) $$invalidate(4, isInCart = $$props.isInCart);
    		if ("buttonText" in $$props) $$invalidate(5, buttonText = $$props.buttonText);
    	};

    	let buttonText;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*isInCart*/ 16) {
    			 $$invalidate(5, buttonText = isInCart ? "Remove from cart" : "Add to cart");
    		}
    	};

    	return [name, description, amount, bullets, isInCart, buttonText, toggleAdd, images];
    }

    class Preset_description extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$i, create_fragment$i, safe_not_equal, {
    			name: 0,
    			description: 1,
    			amount: 2,
    			bullets: 3,
    			images: 7
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Preset_description",
    			options,
    			id: create_fragment$i.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*name*/ ctx[0] === undefined && !("name" in props)) {
    			console.warn("<Preset_description> was created without expected prop 'name'");
    		}

    		if (/*description*/ ctx[1] === undefined && !("description" in props)) {
    			console.warn("<Preset_description> was created without expected prop 'description'");
    		}

    		if (/*amount*/ ctx[2] === undefined && !("amount" in props)) {
    			console.warn("<Preset_description> was created without expected prop 'amount'");
    		}

    		if (/*bullets*/ ctx[3] === undefined && !("bullets" in props)) {
    			console.warn("<Preset_description> was created without expected prop 'bullets'");
    		}

    		if (/*images*/ ctx[7] === undefined && !("images" in props)) {
    			console.warn("<Preset_description> was created without expected prop 'images'");
    		}
    	}

    	get name() {
    		throw new Error("<Preset_description>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<Preset_description>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get description() {
    		throw new Error("<Preset_description>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set description(value) {
    		throw new Error("<Preset_description>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get amount() {
    		throw new Error("<Preset_description>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set amount(value) {
    		throw new Error("<Preset_description>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get bullets() {
    		throw new Error("<Preset_description>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set bullets(value) {
    		throw new Error("<Preset_description>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get images() {
    		throw new Error("<Preset_description>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set images(value) {
    		throw new Error("<Preset_description>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/store/preset/preset-carousel.svelte generated by Svelte v3.21.0 */
    const file$i = "src/components/store/preset/preset-carousel.svelte";

    function get_each_context$5(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[6] = list[i];
    	child_ctx[8] = i;
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[6] = list[i];
    	child_ctx[8] = i;
    	return child_ctx;
    }

    function get_each_context_2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[6] = list[i];
    	return child_ctx;
    }

    function get_each_context_3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[6] = list[i];
    	return child_ctx;
    }

    // (70:8) {#each photos.main as item}
    function create_each_block_3(ctx) {
    	let div;
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			div = element("div");
    			img = element("img");
    			if (img.src !== (img_src_value = /*item*/ ctx[6])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "SRG photography image");
    			attr_dev(img, "class", "svelte-pp3cxg");
    			add_location(img, file$i, 71, 16, 2146);
    			attr_dev(div, "class", "swiper-slide swiper-slide__main svelte-pp3cxg");
    			add_location(div, file$i, 70, 12, 2084);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, img);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*photos*/ 1 && img.src !== (img_src_value = /*item*/ ctx[6])) {
    				attr_dev(img, "src", img_src_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_3.name,
    		type: "each",
    		source: "(70:8) {#each photos.main as item}",
    		ctx
    	});

    	return block;
    }

    // (75:8) {#each photos.examples as item}
    function create_each_block_2(ctx) {
    	let div;
    	let img0;
    	let img0_src_value;
    	let t0;
    	let img1;
    	let img1_src_value;
    	let t1;

    	const block = {
    		c: function create() {
    			div = element("div");
    			img0 = element("img");
    			t0 = space();
    			img1 = element("img");
    			t1 = space();
    			if (img0.src !== (img0_src_value = /*item*/ ctx[6].before)) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "SRG photography image");
    			attr_dev(img0, "class", "svelte-pp3cxg");
    			add_location(img0, file$i, 76, 16, 2323);
    			if (img1.src !== (img1_src_value = /*item*/ ctx[6].after)) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "SRG photography image");
    			attr_dev(img1, "class", "svelte-pp3cxg");
    			add_location(img1, file$i, 77, 16, 2393);
    			attr_dev(div, "class", "swiper-slide svelte-pp3cxg");
    			add_location(div, file$i, 75, 12, 2280);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, img0);
    			append_dev(div, t0);
    			append_dev(div, img1);
    			append_dev(div, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*photos*/ 1 && img0.src !== (img0_src_value = /*item*/ ctx[6].before)) {
    				attr_dev(img0, "src", img0_src_value);
    			}

    			if (dirty & /*photos*/ 1 && img1.src !== (img1_src_value = /*item*/ ctx[6].after)) {
    				attr_dev(img1, "src", img1_src_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_2.name,
    		type: "each",
    		source: "(75:8) {#each photos.examples as item}",
    		ctx
    	});

    	return block;
    }

    // (88:8) {#each photos.main as item, i}
    function create_each_block_1(ctx) {
    	let div;
    	let img;
    	let img_src_value;
    	let dispose;

    	function click_handler(...args) {
    		return /*click_handler*/ ctx[4](/*i*/ ctx[8], ...args);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			img = element("img");
    			if (img.src !== (img_src_value = /*item*/ ctx[6])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "SRG photography image");
    			attr_dev(img, "class", "svelte-pp3cxg");
    			add_location(img, file$i, 89, 16, 2881);
    			attr_dev(div, "class", "swiper-slide swiper-slide__main svelte-pp3cxg");
    			add_location(div, file$i, 88, 12, 2771);
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, div, anchor);
    			append_dev(div, img);
    			if (remount) dispose();
    			dispose = listen_dev(div, "click", click_handler, false, false, false);
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty & /*photos*/ 1 && img.src !== (img_src_value = /*item*/ ctx[6])) {
    				attr_dev(img, "src", img_src_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(88:8) {#each photos.main as item, i}",
    		ctx
    	});

    	return block;
    }

    // (93:8) {#each photos.examples as item, i}
    function create_each_block$5(ctx) {
    	let div;
    	let img0;
    	let img0_src_value;
    	let t0;
    	let img1;
    	let img1_src_value;
    	let t1;
    	let dispose;

    	function click_handler_1(...args) {
    		return /*click_handler_1*/ ctx[5](/*i*/ ctx[8], ...args);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			img0 = element("img");
    			t0 = space();
    			img1 = element("img");
    			t1 = space();
    			if (img0.src !== (img0_src_value = /*item*/ ctx[6].before)) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "SRG photography image");
    			attr_dev(img0, "class", "svelte-pp3cxg");
    			add_location(img0, file$i, 94, 16, 3111);
    			if (img1.src !== (img1_src_value = /*item*/ ctx[6].after)) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "SRG photography image");
    			attr_dev(img1, "class", "svelte-pp3cxg");
    			add_location(img1, file$i, 95, 16, 3181);
    			attr_dev(div, "class", "swiper-slide svelte-pp3cxg");
    			add_location(div, file$i, 93, 12, 3018);
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, div, anchor);
    			append_dev(div, img0);
    			append_dev(div, t0);
    			append_dev(div, img1);
    			append_dev(div, t1);
    			if (remount) dispose();
    			dispose = listen_dev(div, "click", click_handler_1, false, false, false);
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty & /*photos*/ 1 && img0.src !== (img0_src_value = /*item*/ ctx[6].before)) {
    				attr_dev(img0, "src", img0_src_value);
    			}

    			if (dirty & /*photos*/ 1 && img1.src !== (img1_src_value = /*item*/ ctx[6].after)) {
    				attr_dev(img1, "src", img1_src_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$5.name,
    		type: "each",
    		source: "(93:8) {#each photos.examples as item, i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$j(ctx) {
    	let div6;
    	let div3;
    	let div0;
    	let t0;
    	let t1;
    	let div1;
    	let t2;
    	let div2;
    	let t3;
    	let div5;
    	let div4;
    	let t4;
    	let each_value_3 = /*photos*/ ctx[0].main;
    	validate_each_argument(each_value_3);
    	let each_blocks_3 = [];

    	for (let i = 0; i < each_value_3.length; i += 1) {
    		each_blocks_3[i] = create_each_block_3(get_each_context_3(ctx, each_value_3, i));
    	}

    	let each_value_2 = /*photos*/ ctx[0].examples;
    	validate_each_argument(each_value_2);
    	let each_blocks_2 = [];

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		each_blocks_2[i] = create_each_block_2(get_each_context_2(ctx, each_value_2, i));
    	}

    	let each_value_1 = /*photos*/ ctx[0].main;
    	validate_each_argument(each_value_1);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	let each_value = /*photos*/ ctx[0].examples;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$5(get_each_context$5(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div6 = element("div");
    			div3 = element("div");
    			div0 = element("div");

    			for (let i = 0; i < each_blocks_3.length; i += 1) {
    				each_blocks_3[i].c();
    			}

    			t0 = space();

    			for (let i = 0; i < each_blocks_2.length; i += 1) {
    				each_blocks_2[i].c();
    			}

    			t1 = space();
    			div1 = element("div");
    			t2 = space();
    			div2 = element("div");
    			t3 = space();
    			div5 = element("div");
    			div4 = element("div");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t4 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div0, "class", "swiper-wrapper");
    			add_location(div0, file$i, 68, 8, 2007);
    			attr_dev(div1, "class", "swiper-button-next svelte-pp3cxg");
    			add_location(div1, file$i, 82, 8, 2536);
    			attr_dev(div2, "class", "swiper-button-prev svelte-pp3cxg");
    			add_location(div2, file$i, 83, 8, 2583);
    			attr_dev(div3, "class", "swiper-container gallery-top");
    			add_location(div3, file$i, 67, 4, 1956);
    			attr_dev(div4, "class", "swiper-wrapper");
    			add_location(div4, file$i, 86, 8, 2691);
    			attr_dev(div5, "class", "swiper-container gallery-thumbs svelte-pp3cxg");
    			add_location(div5, file$i, 85, 4, 2637);
    			attr_dev(div6, "class", "wrapper svelte-pp3cxg");
    			add_location(div6, file$i, 66, 0, 1930);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div6, anchor);
    			append_dev(div6, div3);
    			append_dev(div3, div0);

    			for (let i = 0; i < each_blocks_3.length; i += 1) {
    				each_blocks_3[i].m(div0, null);
    			}

    			append_dev(div0, t0);

    			for (let i = 0; i < each_blocks_2.length; i += 1) {
    				each_blocks_2[i].m(div0, null);
    			}

    			append_dev(div3, t1);
    			append_dev(div3, div1);
    			append_dev(div3, t2);
    			append_dev(div3, div2);
    			append_dev(div6, t3);
    			append_dev(div6, div5);
    			append_dev(div5, div4);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(div4, null);
    			}

    			append_dev(div4, t4);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div4, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*photos*/ 1) {
    				each_value_3 = /*photos*/ ctx[0].main;
    				validate_each_argument(each_value_3);
    				let i;

    				for (i = 0; i < each_value_3.length; i += 1) {
    					const child_ctx = get_each_context_3(ctx, each_value_3, i);

    					if (each_blocks_3[i]) {
    						each_blocks_3[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_3[i] = create_each_block_3(child_ctx);
    						each_blocks_3[i].c();
    						each_blocks_3[i].m(div0, t0);
    					}
    				}

    				for (; i < each_blocks_3.length; i += 1) {
    					each_blocks_3[i].d(1);
    				}

    				each_blocks_3.length = each_value_3.length;
    			}

    			if (dirty & /*photos*/ 1) {
    				each_value_2 = /*photos*/ ctx[0].examples;
    				validate_each_argument(each_value_2);
    				let i;

    				for (i = 0; i < each_value_2.length; i += 1) {
    					const child_ctx = get_each_context_2(ctx, each_value_2, i);

    					if (each_blocks_2[i]) {
    						each_blocks_2[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_2[i] = create_each_block_2(child_ctx);
    						each_blocks_2[i].c();
    						each_blocks_2[i].m(div0, null);
    					}
    				}

    				for (; i < each_blocks_2.length; i += 1) {
    					each_blocks_2[i].d(1);
    				}

    				each_blocks_2.length = each_value_2.length;
    			}

    			if (dirty & /*galleryTop, index, photos*/ 7) {
    				each_value_1 = /*photos*/ ctx[0].main;
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_1(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(div4, t4);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_1.length;
    			}

    			if (dirty & /*galleryTop, index, photos*/ 7) {
    				each_value = /*photos*/ ctx[0].examples;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$5(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$5(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div4, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div6);
    			destroy_each(each_blocks_3, detaching);
    			destroy_each(each_blocks_2, detaching);
    			destroy_each(each_blocks_1, detaching);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$j.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$j($$self, $$props, $$invalidate) {
    	let { photos } = $$props;
    	let { index } = $$props;
    	let galleryTop;
    	let galleryThumbs;

    	onMount(async () => {
    		$$invalidate(2, galleryTop = new Swiper(".gallery-top",
    		{
    				spaceBetween: 10,
    				thumbs: { swiper: galleryThumbs },
    				navigation: {
    					nextEl: ".swiper-button-next",
    					prevEl: ".swiper-button-prev"
    				}
    			}));

    		galleryThumbs = new Swiper(".gallery-thumbs",
    		{
    				freeMode: true,
    				slidesPerView: 3,
    				spaceBetween: 15,
    				watchSlidesVisibility: true,
    				watchSlidesProgress: true
    			});
    	});

    	const writable_props = ["photos", "index"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Preset_carousel> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Preset_carousel", $$slots, []);

    	const click_handler = i => {
    		galleryTop[index].slideTo(i);
    	};

    	const click_handler_1 = i => {
    		galleryTop[index].slideTo(i + 1);
    	};

    	$$self.$set = $$props => {
    		if ("photos" in $$props) $$invalidate(0, photos = $$props.photos);
    		if ("index" in $$props) $$invalidate(1, index = $$props.index);
    	};

    	$$self.$capture_state = () => ({
    		photos,
    		onMount,
    		Swiper,
    		index,
    		galleryTop,
    		galleryThumbs
    	});

    	$$self.$inject_state = $$props => {
    		if ("photos" in $$props) $$invalidate(0, photos = $$props.photos);
    		if ("index" in $$props) $$invalidate(1, index = $$props.index);
    		if ("galleryTop" in $$props) $$invalidate(2, galleryTop = $$props.galleryTop);
    		if ("galleryThumbs" in $$props) galleryThumbs = $$props.galleryThumbs;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [photos, index, galleryTop, galleryThumbs, click_handler, click_handler_1];
    }

    class Preset_carousel extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$j, create_fragment$j, safe_not_equal, { photos: 0, index: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Preset_carousel",
    			options,
    			id: create_fragment$j.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*photos*/ ctx[0] === undefined && !("photos" in props)) {
    			console.warn("<Preset_carousel> was created without expected prop 'photos'");
    		}

    		if (/*index*/ ctx[1] === undefined && !("index" in props)) {
    			console.warn("<Preset_carousel> was created without expected prop 'index'");
    		}
    	}

    	get photos() {
    		throw new Error("<Preset_carousel>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set photos(value) {
    		throw new Error("<Preset_carousel>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get index() {
    		throw new Error("<Preset_carousel>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set index(value) {
    		throw new Error("<Preset_carousel>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    var presets = [{
      name: "rosy",
      description: "SRG photography custom preset",
      bullets: ["works best with yellows and reds or pinks", "great for a warm skin tone"],
      amount: 600,
      images: {
        main: ["https://res.cloudinary.com/savanna-photos/image/upload/v1588563738/media/3_kt06bc.jpg"],
        examples: [{
          before: "https://res.cloudinary.com/savanna-photos/image/upload/v1588566994/media/IMG_9686_Original-min_yjnt8d.jpg",
          after: "https://res.cloudinary.com/savanna-photos/image/upload/v1588566994/media/IMG_9686_Original_HEIC-min_cy11wc.jpg"
        }, {
          before: "https://res.cloudinary.com/savanna-photos/image/upload/v1588566995/media/3068273985258910952_IMG_4809-min_k1mtdc.jpg",
          after: "https://res.cloudinary.com/savanna-photos/image/upload/v1588566994/media/3068273985258910952_IMG_4809_Original-min_t27tir.jpg"
        }, {
          before: "https://res.cloudinary.com/savanna-photos/image/upload/v1588566995/media/7699311479317259579_IMG_4132-min_zs8ydw.jpg",
          after: "https://res.cloudinary.com/savanna-photos/image/upload/v1588566994/media/7699311479317259579_IMG_4132_Original-min_ua3dwp.jpg"
        }, {
          before: "https://res.cloudinary.com/savanna-photos/image/upload/v1588567064/media/IMG_4991-min_onq0x1.jpg",
          after: "https://res.cloudinary.com/savanna-photos/image/upload/v1588567064/media/9587107D-A8E9-475D-833B-79B215B6E356-min_fnhhpp.jpg"
        }, {
          before: "https://res.cloudinary.com/savanna-photos/image/upload/v1588567354/media/IMG_8926-min_fmquds.jpg",
          after: "https://res.cloudinary.com/savanna-photos/image/upload/v1588567354/media/IMG_8926_Original-min_nazg8b.jpg"
        }]
      }
    }, {
      name: "rare",
      description: "SRG photography custom preset",
      bullets: ["works best with oranges and greens", "enhances blue to appear teal"],
      amount: 600,
      images: {
        main: ["https://res.cloudinary.com/savanna-photos/image/upload/v1588563738/media/IMG_2685_lg1nph.jpg"],
        examples: [{
          before: "https://res.cloudinary.com/savanna-photos/image/upload/v1588568913/media/IMG_2638123-min_ggrrhv.jpg",
          after: "https://res.cloudinary.com/savanna-photos/image/upload/v1588568913/media/IMG_2638-min_d8tmfd.jpg"
        }, {
          before: "https://res.cloudinary.com/savanna-photos/image/upload/v1588568913/media/IMG_9337-min_hl70mj.jpg",
          after: "https://res.cloudinary.com/savanna-photos/image/upload/v1588568913/media/IMG_9337_Original-min_qzug7j.jpg"
        }, {
          before: "https://res.cloudinary.com/savanna-photos/image/upload/v1588569085/media/IMG_1870-min_yllajx.jpg",
          after: "https://res.cloudinary.com/savanna-photos/image/upload/v1588569085/media/IMG_1870_Original-min_gisncr.jpg"
        }, {
          before: "https://res.cloudinary.com/savanna-photos/image/upload/v1588569085/media/6632221868625984017_IMG_6048-min_cztsmk.jpg",
          after: "https://res.cloudinary.com/savanna-photos/image/upload/v1588569085/media/6632221868625984017_IMG_6048_Original-min_utuipa.jpg"
        }, {
          before: "https://res.cloudinary.com/savanna-photos/image/upload/v1588569085/media/8FDE033F-7092-4F92-AA57-77E52E946C24-min_l7m4tk.jpg",
          after: "https://res.cloudinary.com/savanna-photos/image/upload/v1588569085/media/8FDE033F-7092-4F92-AA57-77E52E946C24_Original-min_eky9sb.jpg"
        }]
      }
    }, {
      name: "rust",
      description: "SRG photography custom preset",
      bullets: ["works best with blues and orange or browns", "lower saturation of color"],
      amount: 600,
      images: {
        main: ["https://res.cloudinary.com/savanna-photos/image/upload/v1588563738/media/1_uq9hue.jpg"],
        examples: [{
          before: "https://res.cloudinary.com/savanna-photos/image/upload/v1588567762/media/IMG_8218-min_pr21ax.jpg",
          after: "https://res.cloudinary.com/savanna-photos/image/upload/v1588567762/media/IMG_8218_Original-min_emlxb9.jpg"
        }, {
          before: "https://res.cloudinary.com/savanna-photos/image/upload/v1588568282/media/IMG_4806-min_abgz7q.jpg",
          after: "https://res.cloudinary.com/savanna-photos/image/upload/v1588567762/media/IMG_4806_Original-min_kmkxjr.jpg"
        }, {
          before: "https://res.cloudinary.com/savanna-photos/image/upload/v1588567762/media/IMG_6623-min_cujx6z.jpg",
          after: "https://res.cloudinary.com/savanna-photos/image/upload/v1588567762/media/IMG_6623_Original-min_vjzi6a.jpg"
        }, {
          before: "https://res.cloudinary.com/savanna-photos/image/upload/v1588567763/media/-550672943976337328_IMG_3997-min_dxr8rl.jpg",
          after: "https://res.cloudinary.com/savanna-photos/image/upload/v1588567763/media/-550672943976337328_IMG_3997_Original-min_sh2ruh.jpg"
        }, {
          before: "https://res.cloudinary.com/savanna-photos/image/upload/v1588568282/media/IMG_5301__1_-min_hfcvx2.jpg",
          after: "https://res.cloudinary.com/savanna-photos/image/upload/v1588567762/media/IMG_5300_Original-min_ot6hlp.jpg"
        }]
      }
    }, {
      name: "rays",
      description: "SRG photography custom preset",
      bullets: ["works best with bright colors and deep shadows", "brighter look"],
      amount: 600,
      images: {
        main: ["https://res.cloudinary.com/savanna-photos/image/upload/v1588563738/media/2_lotoro.jpg"],
        examples: [{
          before: "https://res.cloudinary.com/savanna-photos/image/upload/v1588565939/media/IMG_7975_ajnwdi.jpg",
          after: "https://res.cloudinary.com/savanna-photos/image/upload/v1588565939/media/IMG_2734_s2mekc.jpg"
        }, {
          before: "https://res.cloudinary.com/savanna-photos/image/upload/v1588566517/media/IMG_9238-min_edxdax.jpg",
          after: "https://res.cloudinary.com/savanna-photos/image/upload/v1588565939/media/IMG_2732_eaoibx.jpg"
        }, {
          before: "https://res.cloudinary.com/savanna-photos/image/upload/v1588566146/media/IMG_4381_z7hxjw.jpg",
          after: "https://res.cloudinary.com/savanna-photos/image/upload/v1588565939/media/675CF83B-E996-4767-A037-4E7731D46F3A_r6pywj.jpg"
        }, {
          before: "https://res.cloudinary.com/savanna-photos/image/upload/v1588565939/media/IMG_7882_ypnxzo.jpg",
          after: "https://res.cloudinary.com/savanna-photos/image/upload/v1588565939/media/IMG_2731_vqeq66.jpg"
        }, {
          before: "https://res.cloudinary.com/savanna-photos/image/upload/v1588565939/media/IMG_5418_q4klel.jpg",
          after: "https://res.cloudinary.com/savanna-photos/image/upload/v1588565939/media/IMG_2735_ixmy7p.jpg"
        }]
      }
    }, {
      name: "preset package",
      description: "All 4 SRG photography presets",
      bullets: ["rosy", "rare", "rust", "rays"],
      amount: 2000,
      images: {
        main: ["https://res.cloudinary.com/savanna-photos/image/upload/v1588563738/media/3_kt06bc.jpg", "https://res.cloudinary.com/savanna-photos/image/upload/v1588563738/media/IMG_2685_lg1nph.jpg", "https://res.cloudinary.com/savanna-photos/image/upload/v1588563738/media/1_uq9hue.jpg", "https://res.cloudinary.com/savanna-photos/image/upload/v1588563738/media/2_lotoro.jpg"],
        examples: []
      }
    }];

    /* src/components/store/preset/preset.svelte generated by Svelte v3.21.0 */
    const file$j = "src/components/store/preset/preset.svelte";

    function get_each_context$6(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[0] = list[i];
    	child_ctx[2] = i;
    	return child_ctx;
    }

    // (37:0) {#each presets as preset, i}
    function create_each_block$6(ctx) {
    	let div;
    	let t0;
    	let t1;
    	let current;

    	const presetcarousel = new Preset_carousel({
    			props: {
    				photos: /*preset*/ ctx[0].images,
    				index: /*i*/ ctx[2]
    			},
    			$$inline: true
    		});

    	const presetdescription_spread_levels = [/*preset*/ ctx[0]];
    	let presetdescription_props = {};

    	for (let i = 0; i < presetdescription_spread_levels.length; i += 1) {
    		presetdescription_props = assign(presetdescription_props, presetdescription_spread_levels[i]);
    	}

    	const presetdescription = new Preset_description({
    			props: presetdescription_props,
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(presetcarousel.$$.fragment);
    			t0 = space();
    			create_component(presetdescription.$$.fragment);
    			t1 = space();
    			attr_dev(div, "class", "preset svelte-8k71lc");
    			add_location(div, file$j, 37, 4, 874);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(presetcarousel, div, null);
    			append_dev(div, t0);
    			mount_component(presetdescription, div, null);
    			append_dev(div, t1);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const presetdescription_changes = (dirty & /*presets*/ 0)
    			? get_spread_update(presetdescription_spread_levels, [get_spread_object(/*preset*/ ctx[0])])
    			: {};

    			presetdescription.$set(presetdescription_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(presetcarousel.$$.fragment, local);
    			transition_in(presetdescription.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(presetcarousel.$$.fragment, local);
    			transition_out(presetdescription.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(presetcarousel);
    			destroy_component(presetdescription);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$6.name,
    		type: "each",
    		source: "(37:0) {#each presets as preset, i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$k(ctx) {
    	let h1;
    	let t1;
    	let div;
    	let current;
    	let each_value = presets;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$6(get_each_context$6(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			h1.textContent = "Presets";
    			t1 = space();
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(h1, "class", "title sg-green vollkorn svelte-8k71lc");
    			add_location(h1, file$j, 34, 0, 770);
    			attr_dev(div, "class", "presets");
    			add_location(div, file$j, 35, 0, 819);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*presets*/ 0) {
    				each_value = presets;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$6(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$6(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$k.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$k($$self, $$props, $$invalidate) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Preset> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Preset", $$slots, []);

    	$$self.$capture_state = () => ({
    		PresetDescription: Preset_description,
    		PresetCarousel: Preset_carousel,
    		presets
    	});

    	return [];
    }

    class Preset extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$k, create_fragment$k, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Preset",
    			options,
    			id: create_fragment$k.name
    		});
    	}
    }

    function _toConsumableArray(arr) {
      return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread();
    }

    function _arrayWithoutHoles(arr) {
      if (Array.isArray(arr)) {
        for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

        return arr2;
      }
    }

    function _iterableToArray(iter) {
      if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter);
    }

    function _nonIterableSpread() {
      throw new TypeError("Invalid attempt to spread non-iterable instance");
    }

    var V3_URL = 'https://js.stripe.com/v3';
    var V3_URL_REGEX = /^https:\/\/js\.stripe\.com\/v3\/?(\?.*)?$/;
    var EXISTING_SCRIPT_MESSAGE = 'loadStripe.setLoadParameters was called but an existing Stripe.js script already exists in the document; existing script parameters will be used';
    var findScript = function findScript() {
      var scripts = document.querySelectorAll("script[src^=\"".concat(V3_URL, "\"]"));

      for (var i = 0; i < scripts.length; i++) {
        var script = scripts[i];

        if (!V3_URL_REGEX.test(script.src)) {
          continue;
        }

        return script;
      }

      return null;
    };

    var injectScript = function injectScript(params) {
      var queryString = params && !params.advancedFraudSignals ? '?advancedFraudSignals=false' : '';
      var script = document.createElement('script');
      script.src = "".concat(V3_URL).concat(queryString);
      var headOrBody = document.head || document.body;

      if (!headOrBody) {
        throw new Error('Expected document.body not to be null. Stripe.js requires a <body> element.');
      }

      headOrBody.appendChild(script);
      return script;
    };

    var registerWrapper = function registerWrapper(stripe) {
      if (!stripe || !stripe._registerWrapper) {
        return;
      }

      stripe._registerWrapper({
        name: 'stripe-js',
        version: "1.5.0"
      });
    };

    var stripePromise = null;
    var loadScript = function loadScript(params) {
      // Ensure that we only attempt to load Stripe.js at most once
      if (stripePromise !== null) {
        return stripePromise;
      }

      stripePromise = new Promise(function (resolve, reject) {
        if (typeof window === 'undefined') {
          // Resolve to null when imported server side. This makes the module
          // safe to import in an isomorphic code base.
          resolve(null);
          return;
        }

        if (window.Stripe && params) {
          console.warn(EXISTING_SCRIPT_MESSAGE);
        }

        if (window.Stripe) {
          resolve(window.Stripe);
          return;
        }

        try {
          var script = findScript();

          if (script && params) {
            console.warn(EXISTING_SCRIPT_MESSAGE);
          } else if (!script) {
            script = injectScript(params);
          }

          script.addEventListener('load', function () {
            if (window.Stripe) {
              resolve(window.Stripe);
            } else {
              reject(new Error('Stripe.js not available'));
            }
          });
          script.addEventListener('error', function () {
            reject(new Error('Failed to load Stripe.js'));
          });
        } catch (error) {
          reject(error);
          return;
        }
      });
      return stripePromise;
    };
    var initStripe = function initStripe(maybeStripe, args) {
      if (maybeStripe === null) {
        return null;
      }

      var stripe = maybeStripe.apply(void 0, _toConsumableArray(args));
      registerWrapper(stripe);
      return stripe;
    };

    // own script injection.

    var stripePromise$1 = Promise.resolve().then(function () {
      return loadScript(null);
    });
    var loadCalled = false;
    stripePromise$1["catch"](function (err) {
      if (!loadCalled) {
        console.warn(err);
      }
    });
    var loadStripe = function loadStripe() {
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      loadCalled = true;
      return stripePromise$1.then(function (maybeStripe) {
        return initStripe(maybeStripe, args);
      });
    };

    /* src/components/store/cart/cart.svelte generated by Svelte v3.21.0 */
    const file$k = "src/components/store/cart/cart.svelte";

    function get_each_context$7(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[6] = list[i];
    	return child_ctx;
    }

    // (68:4) {#if showItems}
    function create_if_block$7(ctx) {
    	let div1;
    	let p;
    	let t1;
    	let div0;
    	let t2;
    	let t3;
    	let button;
    	let div1_class_value;
    	let div1_intro;
    	let div1_outro;
    	let current;
    	let dispose;
    	let each_value = /*$cart*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$7(get_each_context$7(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			p = element("p");
    			p.textContent = "CART";
    			t1 = space();
    			div0 = element("div");
    			t2 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t3 = space();
    			button = element("button");
    			button.textContent = "Proceed to checkout";
    			attr_dev(p, "class", "cart-title svelte-or1rb6");
    			add_location(p, file$k, 69, 12, 2253);
    			attr_dev(div0, "class", "cart-title_border");
    			add_location(div0, file$k, 70, 12, 2296);
    			attr_dev(button, "class", "button alegreya svelte-or1rb6");
    			add_location(button, file$k, 76, 12, 2503);
    			attr_dev(div1, "class", div1_class_value = "" + ((/*showItems*/ ctx[0] ? "items-show" : "items-hide") + " items" + " svelte-or1rb6"));
    			add_location(div1, file$k, 68, 8, 2104);
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, p);
    			append_dev(div1, t1);
    			append_dev(div1, div0);
    			append_dev(div1, t2);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div1, null);
    			}

    			append_dev(div1, t3);
    			append_dev(div1, button);
    			current = true;
    			if (remount) dispose();
    			dispose = listen_dev(button, "click", /*proceedToCheckout*/ ctx[3], false, false, false);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$cart*/ 2) {
    				each_value = /*$cart*/ ctx[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$7(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$7(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div1, t3);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (!current || dirty & /*showItems*/ 1 && div1_class_value !== (div1_class_value = "" + ((/*showItems*/ ctx[0] ? "items-show" : "items-hide") + " items" + " svelte-or1rb6"))) {
    				attr_dev(div1, "class", div1_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (div1_outro) div1_outro.end(1);
    				if (!div1_intro) div1_intro = create_in_transition(div1, fly, { x: 200, duration: 300 });
    				div1_intro.start();
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (div1_intro) div1_intro.invalidate();
    			div1_outro = create_out_transition(div1, fly, { x: 200, duration: 300 });
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			destroy_each(each_blocks, detaching);
    			if (detaching && div1_outro) div1_outro.end();
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$7.name,
    		type: "if",
    		source: "(68:4) {#if showItems}",
    		ctx
    	});

    	return block;
    }

    // (72:8) {#each $cart as item}
    function create_each_block$7(ctx) {
    	let div;
    	let p;
    	let t0_value = /*item*/ ctx[6].name + "";
    	let t0;
    	let t1;
    	let t2_value = /*item*/ ctx[6].amount / 100 + "";
    	let t2;

    	const block = {
    		c: function create() {
    			div = element("div");
    			p = element("p");
    			t0 = text(t0_value);
    			t1 = text(" - $");
    			t2 = text(t2_value);
    			attr_dev(p, "class", "svelte-or1rb6");
    			add_location(p, file$k, 73, 16, 2416);
    			attr_dev(div, "class", "cart-item svelte-or1rb6");
    			add_location(div, file$k, 72, 12, 2376);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, p);
    			append_dev(p, t0);
    			append_dev(p, t1);
    			append_dev(p, t2);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$cart*/ 2 && t0_value !== (t0_value = /*item*/ ctx[6].name + "")) set_data_dev(t0, t0_value);
    			if (dirty & /*$cart*/ 2 && t2_value !== (t2_value = /*item*/ ctx[6].amount / 100 + "")) set_data_dev(t2, t2_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$7.name,
    		type: "each",
    		source: "(72:8) {#each $cart as item}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$l(ctx) {
    	let div1;
    	let div0;
    	let h2;
    	let i0;
    	let t0;

    	let t1_value = (/*$cart*/ ctx[1].length > 0
    	? `(${/*$cart*/ ctx[1].length})`
    	: "") + "";

    	let t1;
    	let t2;
    	let i1;
    	let i1_class_value;
    	let t3;
    	let current;
    	let dispose;
    	let if_block = /*showItems*/ ctx[0] && create_if_block$7(ctx);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			h2 = element("h2");
    			i0 = element("i");
    			t0 = space();
    			t1 = text(t1_value);
    			t2 = space();
    			i1 = element("i");
    			t3 = space();
    			if (if_block) if_block.c();
    			attr_dev(i0, "class", "fas fa-shopping-cart sg-green svelte-or1rb6");
    			add_location(i0, file$k, 65, 13, 1894);
    			attr_dev(i1, "class", i1_class_value = "" + ((/*showItems*/ ctx[0] ? "arrow-up" : "arrow-down") + " fas fa-caret-down" + " svelte-or1rb6"));
    			add_location(i1, file$k, 65, 105, 1986);
    			attr_dev(h2, "class", "svelte-or1rb6");
    			add_location(h2, file$k, 65, 8, 1889);
    			attr_dev(div0, "class", "cart-icon svelte-or1rb6");
    			add_location(div0, file$k, 64, 4, 1836);
    			attr_dev(div1, "class", "cart montserrat svelte-or1rb6");
    			add_location(div1, file$k, 63, 0, 1802);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, h2);
    			append_dev(h2, i0);
    			append_dev(h2, t0);
    			append_dev(h2, t1);
    			append_dev(h2, t2);
    			append_dev(h2, i1);
    			append_dev(div1, t3);
    			if (if_block) if_block.m(div1, null);
    			current = true;
    			if (remount) dispose();
    			dispose = listen_dev(div0, "click", /*togglCart*/ ctx[2], false, false, false);
    		},
    		p: function update(ctx, [dirty]) {
    			if ((!current || dirty & /*$cart*/ 2) && t1_value !== (t1_value = (/*$cart*/ ctx[1].length > 0
    			? `(${/*$cart*/ ctx[1].length})`
    			: "") + "")) set_data_dev(t1, t1_value);

    			if (!current || dirty & /*showItems*/ 1 && i1_class_value !== (i1_class_value = "" + ((/*showItems*/ ctx[0] ? "arrow-up" : "arrow-down") + " fas fa-caret-down" + " svelte-or1rb6"))) {
    				attr_dev(i1, "class", i1_class_value);
    			}

    			if (/*showItems*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*showItems*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$7(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div1, null);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if (if_block) if_block.d();
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$l.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$l($$self, $$props, $$invalidate) {
    	let $cart;
    	validate_store(cart, "cart");
    	component_subscribe($$self, cart, $$value => $$invalidate(1, $cart = $$value));
    	let showItems = false;
    	let stripe;

    	onMount(async () => {
    		stripe = await loadStripe("pk_test_LnSZ7UkQkfmtKtBr2Hdjtbtm00MLu5KDIl");
    	});

    	const togglCart = () => {
    		$$invalidate(0, showItems = !showItems);
    	};

    	//     line_items: [
    	//     {
    	//         name: 'T-shirt',
    	//         description: 'SRG Preset',
    	//         amount: 6,
    	//         currency: 'usd',
    	//         quantity: 1,
    	//     },
    	// ],
    	const proceedToCheckout = () => {
    		if (sessionInfo.line_items.length > 0) {
    			async function createSession() {
    				const response = await fetch("http://localhost:3000/api/store", {
    					method: "POST",
    					mode: "cors",
    					headers: { "Content-Type": "application/json" },
    					body: JSON.stringify(sessionInfo)
    				});

    				return response.json();
    			}

    			createSession().then(data => {
    				(async () => {
    					const { error } = await stripe.redirectToCheckout({
    						// Make the id field from the Checkout Session creation API response
    						// available to this file, so you can provide it as parameter here
    						// instead of the {{CHECKOUT_SESSION_ID}} placeholder.
    						sessionId: data.id
    					});
    				})();
    			});
    		}
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Cart> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Cart", $$slots, []);

    	$$self.$capture_state = () => ({
    		onMount,
    		fly,
    		fade,
    		cart,
    		loadStripe,
    		showItems,
    		stripe,
    		togglCart,
    		proceedToCheckout,
    		sessionInfo,
    		$cart
    	});

    	$$self.$inject_state = $$props => {
    		if ("showItems" in $$props) $$invalidate(0, showItems = $$props.showItems);
    		if ("stripe" in $$props) stripe = $$props.stripe;
    		if ("sessionInfo" in $$props) sessionInfo = $$props.sessionInfo;
    	};

    	let sessionInfo;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$cart*/ 2) {
    			 sessionInfo = {
    				success_url: "http://localhost:3000/#/success",
    				cancel_url: "http://localhost:3000/#/store",
    				payment_method_types: ["card"],
    				line_items: $cart
    			};
    		}
    	};

    	return [showItems, $cart, togglCart, proceedToCheckout];
    }

    class Cart extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$l, create_fragment$l, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Cart",
    			options,
    			id: create_fragment$l.name
    		});
    	}
    }

    /* src/components/store/Store.svelte generated by Svelte v3.21.0 */
    const file$l = "src/components/store/Store.svelte";

    // (11:0) <PageBanner on:loaded='{() => showPage = true}' img={url}>
    function create_default_slot$3(ctx) {
    	let h1;

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			h1.textContent = "Store";
    			add_location(h1, file$l, 11, 4, 327);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$3.name,
    		type: "slot",
    		source: "(11:0) <PageBanner on:loaded='{() => showPage = true}' img={url}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$m(ctx) {
    	let t0;
    	let t1;
    	let current;
    	const cart = new Cart({ $$inline: true });

    	const pagebanner = new PageBanner({
    			props: {
    				img: url$1,
    				$$slots: { default: [create_default_slot$3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	pagebanner.$on("loaded", /*loaded_handler*/ ctx[1]);
    	const preset = new Preset({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(cart.$$.fragment);
    			t0 = space();
    			create_component(pagebanner.$$.fragment);
    			t1 = space();
    			create_component(preset.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(cart, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(pagebanner, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(preset, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const pagebanner_changes = {};

    			if (dirty & /*$$scope*/ 4) {
    				pagebanner_changes.$$scope = { dirty, ctx };
    			}

    			pagebanner.$set(pagebanner_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(cart.$$.fragment, local);
    			transition_in(pagebanner.$$.fragment, local);
    			transition_in(preset.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(cart.$$.fragment, local);
    			transition_out(pagebanner.$$.fragment, local);
    			transition_out(preset.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(cart, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(pagebanner, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(preset, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$m.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const url$1 = "images/Store-Banner-min.jpg";

    function instance$m($$self, $$props, $$invalidate) {
    	let showPage = false;
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Store> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Store", $$slots, []);
    	const loaded_handler = () => $$invalidate(0, showPage = true);

    	$$self.$capture_state = () => ({
    		onMount,
    		PageBanner,
    		Preset,
    		Cart,
    		url: url$1,
    		showPage
    	});

    	$$self.$inject_state = $$props => {
    		if ("showPage" in $$props) $$invalidate(0, showPage = $$props.showPage);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [showPage, loaded_handler];
    }

    class Store extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$m, create_fragment$m, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Store",
    			options,
    			id: create_fragment$m.name
    		});
    	}
    }

    /* src/components/contact/ContactForm.svelte generated by Svelte v3.21.0 */

    const file$m = "src/components/contact/ContactForm.svelte";

    function create_fragment$n(ctx) {
    	let div3;
    	let div1;
    	let div0;
    	let h1;
    	let t1;
    	let p;
    	let t3;
    	let form;
    	let input0;
    	let t4;
    	let input1;
    	let t5;
    	let input2;
    	let t6;
    	let input3;
    	let t7;
    	let select;
    	let option0;
    	let option1;
    	let option2;
    	let option3;
    	let option4;
    	let t13;
    	let textarea;
    	let t14;
    	let button;
    	let t16;
    	let div2;
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			h1 = element("h1");
    			h1.textContent = "Let's chat";
    			t1 = space();
    			p = element("p");
    			p.textContent = "I’m so glad that you’re interested in working with me. Fill out the form and let’s get planning! Talk to you soon!";
    			t3 = space();
    			form = element("form");
    			input0 = element("input");
    			t4 = space();
    			input1 = element("input");
    			t5 = space();
    			input2 = element("input");
    			t6 = space();
    			input3 = element("input");
    			t7 = space();
    			select = element("select");
    			option0 = element("option");
    			option0.textContent = "Select a package ($50 minimum)";
    			option1 = element("option");
    			option1.textContent = "portrait";
    			option2 = element("option");
    			option2.textContent = "family";
    			option3 = element("option");
    			option3.textContent = "event";
    			option4 = element("option");
    			option4.textContent = "misc";
    			t13 = space();
    			textarea = element("textarea");
    			t14 = space();
    			button = element("button");
    			button.textContent = "Send message";
    			t16 = space();
    			div2 = element("div");
    			img = element("img");
    			attr_dev(h1, "class", "svelte-1iwqgvg");
    			add_location(h1, file$m, 82, 12, 2215);
    			attr_dev(p, "class", "alegreya svelte-1iwqgvg");
    			set_style(p, "font-size", "25px");
    			add_location(p, file$m, 83, 12, 2247);
    			attr_dev(div0, "class", "sg-form__wrapper__header sg-green vollkorn svelte-1iwqgvg");
    			add_location(div0, file$m, 81, 8, 2146);
    			attr_dev(input0, "type", "hidden");
    			attr_dev(input0, "name", "form-name");
    			input0.value = "contact";
    			attr_dev(input0, "class", "svelte-1iwqgvg");
    			add_location(input0, file$m, 86, 12, 2564);
    			attr_dev(input1, "name", "name");
    			attr_dev(input1, "type", "text");
    			attr_dev(input1, "placeholder", "name");
    			attr_dev(input1, "class", "svelte-1iwqgvg");
    			add_location(input1, file$m, 87, 12, 2633);
    			attr_dev(input2, "name", "email");
    			attr_dev(input2, "type", "email");
    			attr_dev(input2, "placeholder", "email");
    			attr_dev(input2, "class", "svelte-1iwqgvg");
    			add_location(input2, file$m, 88, 12, 2698);
    			attr_dev(input3, "name", "phone");
    			attr_dev(input3, "type", "phone");
    			attr_dev(input3, "placeholder", "phone");
    			attr_dev(input3, "class", "svelte-1iwqgvg");
    			add_location(input3, file$m, 89, 12, 2766);
    			option0.__value = "";
    			option0.value = option0.__value;
    			option0.disabled = true;
    			option0.selected = true;
    			attr_dev(option0, "class", "svelte-1iwqgvg");
    			add_location(option0, file$m, 91, 16, 2875);
    			option1.__value = "portrait";
    			option1.value = option1.__value;
    			attr_dev(option1, "class", "svelte-1iwqgvg");
    			add_location(option1, file$m, 92, 16, 2966);
    			option2.__value = "family";
    			option2.value = option2.__value;
    			attr_dev(option2, "class", "svelte-1iwqgvg");
    			add_location(option2, file$m, 93, 16, 3025);
    			option3.__value = "event";
    			option3.value = option3.__value;
    			attr_dev(option3, "class", "svelte-1iwqgvg");
    			add_location(option3, file$m, 94, 16, 3080);
    			option4.__value = "misc";
    			option4.value = option4.__value;
    			attr_dev(option4, "class", "svelte-1iwqgvg");
    			add_location(option4, file$m, 95, 16, 3133);
    			attr_dev(select, "name", "package");
    			attr_dev(select, "class", "svelte-1iwqgvg");
    			add_location(select, file$m, 90, 12, 2834);
    			attr_dev(textarea, "name", "message");
    			attr_dev(textarea, "placeholder", "Tell me about the services you are interested in");
    			attr_dev(textarea, "class", "svelte-1iwqgvg");
    			add_location(textarea, file$m, 98, 12, 3203);
    			attr_dev(button, "name", "submit");
    			attr_dev(button, "type", "submit");
    			attr_dev(button, "class", "svelte-1iwqgvg");
    			add_location(button, file$m, 99, 12, 3315);
    			attr_dev(form, "name", "contact");
    			attr_dev(form, "method", "post");
    			attr_dev(form, "netlify", "");
    			attr_dev(form, "data-netlify-honeybot", "bot-field");
    			attr_dev(form, "class", "sg-form__wrapper__form alegreya svelte-1iwqgvg");
    			add_location(form, file$m, 85, 8, 2434);
    			attr_dev(div1, "class", "sg-form__wrapper svelte-1iwqgvg");
    			add_location(div1, file$m, 80, 4, 2107);
    			if (img.src !== (img_src_value = /*src*/ ctx[0])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "class", "svelte-1iwqgvg");
    			add_location(img, file$m, 104, 4, 3438);
    			attr_dev(div2, "class", "sg-form__image svelte-1iwqgvg");
    			add_location(div2, file$m, 103, 4, 3405);
    			attr_dev(div3, "class", "sg-form svelte-1iwqgvg");
    			add_location(div3, file$m, 79, 0, 2081);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div1);
    			append_dev(div1, div0);
    			append_dev(div0, h1);
    			append_dev(div0, t1);
    			append_dev(div0, p);
    			append_dev(div1, t3);
    			append_dev(div1, form);
    			append_dev(form, input0);
    			append_dev(form, t4);
    			append_dev(form, input1);
    			append_dev(form, t5);
    			append_dev(form, input2);
    			append_dev(form, t6);
    			append_dev(form, input3);
    			append_dev(form, t7);
    			append_dev(form, select);
    			append_dev(select, option0);
    			append_dev(select, option1);
    			append_dev(select, option2);
    			append_dev(select, option3);
    			append_dev(select, option4);
    			append_dev(form, t13);
    			append_dev(form, textarea);
    			append_dev(form, t14);
    			append_dev(form, button);
    			append_dev(div3, t16);
    			append_dev(div3, div2);
    			append_dev(div2, img);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$n.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$n($$self, $$props, $$invalidate) {
    	let src = "images/Coffee.JPG";
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ContactForm> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("ContactForm", $$slots, []);
    	$$self.$capture_state = () => ({ src });

    	$$self.$inject_state = $$props => {
    		if ("src" in $$props) $$invalidate(0, src = $$props.src);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [src];
    }

    class ContactForm extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$n, create_fragment$n, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ContactForm",
    			options,
    			id: create_fragment$n.name
    		});
    	}
    }

    /* src/components/contact/Contact.svelte generated by Svelte v3.21.0 */
    const file$n = "src/components/contact/Contact.svelte";

    // (9:0) <PageBanner img={url}>
    function create_default_slot$4(ctx) {
    	let h1;

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			h1.textContent = "Contact";
    			add_location(h1, file$n, 9, 4, 255);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$4.name,
    		type: "slot",
    		source: "(9:0) <PageBanner img={url}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$o(ctx) {
    	let t0;
    	let t1;
    	let current;

    	const pagebanner = new PageBanner({
    			props: {
    				img: url$2,
    				$$slots: { default: [create_default_slot$4] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const contactform = new ContactForm({ $$inline: true });
    	const footer = new Footer({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(pagebanner.$$.fragment);
    			t0 = space();
    			create_component(contactform.$$.fragment);
    			t1 = space();
    			create_component(footer.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(pagebanner, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(contactform, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(footer, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const pagebanner_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				pagebanner_changes.$$scope = { dirty, ctx };
    			}

    			pagebanner.$set(pagebanner_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(pagebanner.$$.fragment, local);
    			transition_in(contactform.$$.fragment, local);
    			transition_in(footer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(pagebanner.$$.fragment, local);
    			transition_out(contactform.$$.fragment, local);
    			transition_out(footer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(pagebanner, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(contactform, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(footer, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$o.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const url$2 = "./images/Contact-Banner-min.jpg";

    function instance$o($$self, $$props, $$invalidate) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Contact> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Contact", $$slots, []);
    	$$self.$capture_state = () => ({ PageBanner, ContactForm, Footer, url: url$2 });
    	return [];
    }

    class Contact extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$o, create_fragment$o, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Contact",
    			options,
    			id: create_fragment$o.name
    		});
    	}
    }

    /* src/components/nav/NavLinks.svelte generated by Svelte v3.21.0 */
    const file$o = "src/components/nav/NavLinks.svelte";

    // (81:4) <Link on:click="{() => tabSelect('home')}" href="/" class="link-styles sg-green">
    function create_default_slot_5(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "home";
    			attr_dev(p, "class", "svelte-4wknxd");
    			toggle_class(p, "active", /*navSelect*/ ctx[0] === "home");
    			add_location(p, file$o, 80, 85, 2097);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*navSelect*/ 1) {
    				toggle_class(p, "active", /*navSelect*/ ctx[0] === "home");
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_5.name,
    		type: "slot",
    		source: "(81:4) <Link on:click=\\\"{() => tabSelect('home')}\\\" href=\\\"/\\\" class=\\\"link-styles sg-green\\\">",
    		ctx
    	});

    	return block;
    }

    // (82:4) <Link on:click="{() => tabSelect('gallery')}" href="/gallery" class="link-styles sg-green">
    function create_default_slot_4$1(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "gallery";
    			attr_dev(p, "class", "svelte-4wknxd");
    			toggle_class(p, "active", /*navSelect*/ ctx[0] === "gallery");
    			add_location(p, file$o, 81, 95, 2249);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*navSelect*/ 1) {
    				toggle_class(p, "active", /*navSelect*/ ctx[0] === "gallery");
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_4$1.name,
    		type: "slot",
    		source: "(82:4) <Link on:click=\\\"{() => tabSelect('gallery')}\\\" href=\\\"/gallery\\\" class=\\\"link-styles sg-green\\\">",
    		ctx
    	});

    	return block;
    }

    // (83:4) <Link on:click="{() => tabSelect('videography')}" href="/videography" class="link-styles sg-green">
    function create_default_slot_3$1(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "cinema";
    			attr_dev(p, "class", "svelte-4wknxd");
    			toggle_class(p, "active", /*navSelect*/ ctx[0] === "videos");
    			add_location(p, file$o, 82, 103, 2415);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*navSelect*/ 1) {
    				toggle_class(p, "active", /*navSelect*/ ctx[0] === "videos");
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_3$1.name,
    		type: "slot",
    		source: "(83:4) <Link on:click=\\\"{() => tabSelect('videography')}\\\" href=\\\"/videography\\\" class=\\\"link-styles sg-green\\\">",
    		ctx
    	});

    	return block;
    }

    // (84:4) <Link on:click="{() => tabSelect('bio')}" href="/bio" class="link-styles sg-green">
    function create_default_slot_2$1(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "bio";
    			attr_dev(p, "class", "svelte-4wknxd");
    			toggle_class(p, "active", /*navSelect*/ ctx[0] === "bio");
    			add_location(p, file$o, 83, 87, 2563);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*navSelect*/ 1) {
    				toggle_class(p, "active", /*navSelect*/ ctx[0] === "bio");
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2$1.name,
    		type: "slot",
    		source: "(84:4) <Link on:click=\\\"{() => tabSelect('bio')}\\\" href=\\\"/bio\\\" class=\\\"link-styles sg-green\\\">",
    		ctx
    	});

    	return block;
    }

    // (85:4) <Link on:click="{() => tabSelect('store')}" href="/store" class="link-styles sg-green">
    function create_default_slot_1$1(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "store";
    			attr_dev(p, "class", "svelte-4wknxd");
    			toggle_class(p, "active", /*navSelect*/ ctx[0] === "store");
    			add_location(p, file$o, 84, 91, 2709);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*navSelect*/ 1) {
    				toggle_class(p, "active", /*navSelect*/ ctx[0] === "store");
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$1.name,
    		type: "slot",
    		source: "(85:4) <Link on:click=\\\"{() => tabSelect('store')}\\\" href=\\\"/store\\\" class=\\\"link-styles sg-green\\\">",
    		ctx
    	});

    	return block;
    }

    // (86:4) <Link on:click="{() => tabSelect('contact')}" href="/contact" class="link-styles sg-green">
    function create_default_slot$5(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "contact";
    			attr_dev(p, "class", "svelte-4wknxd");
    			toggle_class(p, "active", /*navSelect*/ ctx[0] === "contact");
    			add_location(p, file$o, 85, 95, 2863);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*navSelect*/ 1) {
    				toggle_class(p, "active", /*navSelect*/ ctx[0] === "contact");
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$5.name,
    		type: "slot",
    		source: "(86:4) <Link on:click=\\\"{() => tabSelect('contact')}\\\" href=\\\"/contact\\\" class=\\\"link-styles sg-green\\\">",
    		ctx
    	});

    	return block;
    }

    function create_fragment$p(ctx) {
    	let div1;
    	let div0;
    	let img;
    	let img_src_value;
    	let t0;
    	let t1;
    	let t2;
    	let t3;
    	let t4;
    	let t5;
    	let current;

    	const link0 = new Link({
    			props: {
    				href: "/",
    				class: "link-styles sg-green",
    				$$slots: { default: [create_default_slot_5] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	link0.$on("click", /*click_handler*/ ctx[7]);

    	const link1 = new Link({
    			props: {
    				href: "/gallery",
    				class: "link-styles sg-green",
    				$$slots: { default: [create_default_slot_4$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	link1.$on("click", /*click_handler_1*/ ctx[8]);

    	const link2 = new Link({
    			props: {
    				href: "/videography",
    				class: "link-styles sg-green",
    				$$slots: { default: [create_default_slot_3$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	link2.$on("click", /*click_handler_2*/ ctx[9]);

    	const link3 = new Link({
    			props: {
    				href: "/bio",
    				class: "link-styles sg-green",
    				$$slots: { default: [create_default_slot_2$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	link3.$on("click", /*click_handler_3*/ ctx[10]);

    	const link4 = new Link({
    			props: {
    				href: "/store",
    				class: "link-styles sg-green",
    				$$slots: { default: [create_default_slot_1$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	link4.$on("click", /*click_handler_4*/ ctx[11]);

    	const link5 = new Link({
    			props: {
    				href: "/contact",
    				class: "link-styles sg-green",
    				$$slots: { default: [create_default_slot$5] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	link5.$on("click", /*click_handler_5*/ ctx[12]);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			img = element("img");
    			t0 = space();
    			create_component(link0.$$.fragment);
    			t1 = space();
    			create_component(link1.$$.fragment);
    			t2 = space();
    			create_component(link2.$$.fragment);
    			t3 = space();
    			create_component(link3.$$.fragment);
    			t4 = space();
    			create_component(link4.$$.fragment);
    			t5 = space();
    			create_component(link5.$$.fragment);
    			if (img.src !== (img_src_value = /*src*/ ctx[1])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "class", "svelte-4wknxd");
    			add_location(img, file$o, 79, 21, 1994);
    			attr_dev(div0, "class", "img svelte-4wknxd");
    			add_location(div0, file$o, 79, 4, 1977);
    			attr_dev(div1, "class", "link-container montserrat svelte-4wknxd");
    			add_location(div1, file$o, 78, 0, 1933);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, img);
    			append_dev(div1, t0);
    			mount_component(link0, div1, null);
    			append_dev(div1, t1);
    			mount_component(link1, div1, null);
    			append_dev(div1, t2);
    			mount_component(link2, div1, null);
    			append_dev(div1, t3);
    			mount_component(link3, div1, null);
    			append_dev(div1, t4);
    			mount_component(link4, div1, null);
    			append_dev(div1, t5);
    			mount_component(link5, div1, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const link0_changes = {};

    			if (dirty & /*$$scope, navSelect*/ 8193) {
    				link0_changes.$$scope = { dirty, ctx };
    			}

    			link0.$set(link0_changes);
    			const link1_changes = {};

    			if (dirty & /*$$scope, navSelect*/ 8193) {
    				link1_changes.$$scope = { dirty, ctx };
    			}

    			link1.$set(link1_changes);
    			const link2_changes = {};

    			if (dirty & /*$$scope, navSelect*/ 8193) {
    				link2_changes.$$scope = { dirty, ctx };
    			}

    			link2.$set(link2_changes);
    			const link3_changes = {};

    			if (dirty & /*$$scope, navSelect*/ 8193) {
    				link3_changes.$$scope = { dirty, ctx };
    			}

    			link3.$set(link3_changes);
    			const link4_changes = {};

    			if (dirty & /*$$scope, navSelect*/ 8193) {
    				link4_changes.$$scope = { dirty, ctx };
    			}

    			link4.$set(link4_changes);
    			const link5_changes = {};

    			if (dirty & /*$$scope, navSelect*/ 8193) {
    				link5_changes.$$scope = { dirty, ctx };
    			}

    			link5.$set(link5_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(link0.$$.fragment, local);
    			transition_in(link1.$$.fragment, local);
    			transition_in(link2.$$.fragment, local);
    			transition_in(link3.$$.fragment, local);
    			transition_in(link4.$$.fragment, local);
    			transition_in(link5.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(link0.$$.fragment, local);
    			transition_out(link1.$$.fragment, local);
    			transition_out(link2.$$.fragment, local);
    			transition_out(link3.$$.fragment, local);
    			transition_out(link4.$$.fragment, local);
    			transition_out(link5.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			destroy_component(link0);
    			destroy_component(link1);
    			destroy_component(link2);
    			destroy_component(link3);
    			destroy_component(link4);
    			destroy_component(link5);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$p.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$p($$self, $$props, $$invalidate) {
    	let src = "./images/SavLogo.jpg";
    	let navSelect;
    	let windowSize = window.innerHeight;
    	const dispatch = createEventDispatcher();
    	let { showLinks = false } = $$props;

    	function tabSelect(tab) {
    		scroll(0, 0);
    		$$invalidate(0, navSelect = tab);

    		// if(tab == 'bio') {
    		//     scroll(0, windowSize);
    		// }
    		if (window.innerWidth < 577) {
    			$$invalidate(3, showLinks = false);
    			dispatch("close", false);
    		}
    	}

    	const next = dest => router.send(dest);
    	const writable_props = ["showLinks"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<NavLinks> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("NavLinks", $$slots, []);
    	const click_handler = () => tabSelect("home");
    	const click_handler_1 = () => tabSelect("gallery");
    	const click_handler_2 = () => tabSelect("videography");
    	const click_handler_3 = () => tabSelect("bio");
    	const click_handler_4 = () => tabSelect("store");
    	const click_handler_5 = () => tabSelect("contact");

    	$$self.$set = $$props => {
    		if ("showLinks" in $$props) $$invalidate(3, showLinks = $$props.showLinks);
    	};

    	$$self.$capture_state = () => ({
    		Link,
    		createEventDispatcher,
    		src,
    		navSelect,
    		windowSize,
    		dispatch,
    		showLinks,
    		tabSelect,
    		next
    	});

    	$$self.$inject_state = $$props => {
    		if ("src" in $$props) $$invalidate(1, src = $$props.src);
    		if ("navSelect" in $$props) $$invalidate(0, navSelect = $$props.navSelect);
    		if ("windowSize" in $$props) windowSize = $$props.windowSize;
    		if ("showLinks" in $$props) $$invalidate(3, showLinks = $$props.showLinks);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		navSelect,
    		src,
    		tabSelect,
    		showLinks,
    		windowSize,
    		dispatch,
    		next,
    		click_handler,
    		click_handler_1,
    		click_handler_2,
    		click_handler_3,
    		click_handler_4,
    		click_handler_5
    	];
    }

    class NavLinks extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$p, create_fragment$p, safe_not_equal, { showLinks: 3 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "NavLinks",
    			options,
    			id: create_fragment$p.name
    		});
    	}

    	get showLinks() {
    		throw new Error("<NavLinks>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set showLinks(value) {
    		throw new Error("<NavLinks>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/nav/HamburgerNav.svelte generated by Svelte v3.21.0 */

    const { console: console_1$3 } = globals;
    const file$p = "src/components/nav/HamburgerNav.svelte";

    // (106:4) {#if showNav}
    function create_if_block_2$2(ctx) {
    	let div;
    	let div_intro;
    	let div_outro;
    	let current;

    	const navlinks = new NavLinks({
    			props: { showLinks: /*showNav*/ ctx[0] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(navlinks.$$.fragment);
    			attr_dev(div, "class", "ham-nav__menu d-flex flex-column flex-md-row svelte-15gg5de");
    			add_location(div, file$p, 106, 8, 2468);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(navlinks, div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const navlinks_changes = {};
    			if (dirty & /*showNav*/ 1) navlinks_changes.showLinks = /*showNav*/ ctx[0];
    			navlinks.$set(navlinks_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(navlinks.$$.fragment, local);

    			add_render_callback(() => {
    				if (div_outro) div_outro.end(1);
    				if (!div_intro) div_intro = create_in_transition(div, fly, { x: 200, duration: 300 });
    				div_intro.start();
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(navlinks.$$.fragment, local);
    			if (div_intro) div_intro.invalidate();
    			div_outro = create_out_transition(div, fly, { x: 200, duration: 300 });
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(navlinks);
    			if (detaching && div_outro) div_outro.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$2.name,
    		type: "if",
    		source: "(106:4) {#if showNav}",
    		ctx
    	});

    	return block;
    }

    // (126:4) {#if showNav}
    function create_if_block_1$4(ctx) {
    	let div;
    	let div_intro;
    	let div_outro;
    	let current;

    	const navlinks = new NavLinks({
    			props: { showLinks: /*showNav*/ ctx[0] },
    			$$inline: true
    		});

    	navlinks.$on("close", /*showMobileNav*/ ctx[1]);

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(navlinks.$$.fragment);
    			attr_dev(div, "class", "ham-nav__menu d-flex flex-column flex-md-row svelte-15gg5de");
    			add_location(div, file$p, 126, 8, 3441);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(navlinks, div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const navlinks_changes = {};
    			if (dirty & /*showNav*/ 1) navlinks_changes.showLinks = /*showNav*/ ctx[0];
    			navlinks.$set(navlinks_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(navlinks.$$.fragment, local);

    			add_render_callback(() => {
    				if (div_outro) div_outro.end(1);
    				if (!div_intro) div_intro = create_in_transition(div, fly, { x: 200, duration: 300 });
    				div_intro.start();
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(navlinks.$$.fragment, local);
    			if (div_intro) div_intro.invalidate();
    			div_outro = create_out_transition(div, fly, { x: 200, duration: 300 });
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(navlinks);
    			if (detaching && div_outro) div_outro.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$4.name,
    		type: "if",
    		source: "(126:4) {#if showNav}",
    		ctx
    	});

    	return block;
    }

    // (132:0) {#if showNav}
    function create_if_block$8(ctx) {
    	let div;
    	let div_transition;
    	let current;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "d-block d-md-none overlay svelte-15gg5de");
    			add_location(div, file$p, 132, 4, 3695);
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, div, anchor);
    			current = true;
    			if (remount) dispose();
    			dispose = listen_dev(div, "click", /*showMobileNav*/ ctx[1], false, false, false);
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!div_transition) div_transition = create_bidirectional_transition(div, fade, {}, true);
    				div_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!div_transition) div_transition = create_bidirectional_transition(div, fade, {}, false);
    			div_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (detaching && div_transition) div_transition.end();
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$8.name,
    		type: "if",
    		source: "(132:0) {#if showNav}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$q(ctx) {
    	let div0;
    	let t0;
    	let button0;
    	let span1;
    	let span0;
    	let t1;
    	let div1;
    	let button1;
    	let span3;
    	let span2;
    	let t2;
    	let t3;
    	let if_block2_anchor;
    	let current;
    	let dispose;
    	let if_block0 = /*showNav*/ ctx[0] && create_if_block_2$2(ctx);
    	let if_block1 = /*showNav*/ ctx[0] && create_if_block_1$4(ctx);
    	let if_block2 = /*showNav*/ ctx[0] && create_if_block$8(ctx);

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			if (if_block0) if_block0.c();
    			t0 = space();
    			button0 = element("button");
    			span1 = element("span");
    			span0 = element("span");
    			t1 = space();
    			div1 = element("div");
    			button1 = element("button");
    			span3 = element("span");
    			span2 = element("span");
    			t2 = space();
    			if (if_block1) if_block1.c();
    			t3 = space();
    			if (if_block2) if_block2.c();
    			if_block2_anchor = empty();
    			attr_dev(span0, "class", "hamburger-inner svelte-15gg5de");
    			add_location(span0, file$p, 113, 12, 2939);
    			attr_dev(span1, "class", "hamburger-box");
    			add_location(span1, file$p, 112, 8, 2894);
    			attr_dev(button0, "class", "hamburger hamburger--slider svelte-15gg5de");
    			attr_dev(button0, "type", "button");
    			toggle_class(button0, "is-active", /*showNav*/ ctx[0] == true);
    			add_location(button0, file$p, 111, 4, 2754);
    			attr_dev(div0, "class", "ham-nav d-none d-md-flex svelte-15gg5de");
    			add_location(div0, file$p, 104, 0, 2403);
    			attr_dev(span2, "class", "hamburger-inner svelte-15gg5de");
    			add_location(span2, file$p, 122, 12, 3346);
    			attr_dev(span3, "class", "hamburger-box");
    			add_location(span3, file$p, 121, 8, 3305);
    			attr_dev(button1, "class", "hamburger hamburger--slider svelte-15gg5de");
    			attr_dev(button1, "type", "button");
    			toggle_class(button1, "is-active", /*showNav*/ ctx[0] == true);
    			add_location(button1, file$p, 120, 4, 3175);
    			attr_dev(div1, "class", "ham-nav d-flex d-md-none flex-column svelte-15gg5de");
    			toggle_class(div1, "hide-nav", /*showNav*/ ctx[0] == false);
    			add_location(div1, file$p, 118, 0, 3016);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, div0, anchor);
    			if (if_block0) if_block0.m(div0, null);
    			append_dev(div0, t0);
    			append_dev(div0, button0);
    			append_dev(button0, span1);
    			append_dev(span1, span0);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, button1);
    			append_dev(button1, span3);
    			append_dev(span3, span2);
    			append_dev(div1, t2);
    			if (if_block1) if_block1.m(div1, null);
    			insert_dev(target, t3, anchor);
    			if (if_block2) if_block2.m(target, anchor);
    			insert_dev(target, if_block2_anchor, anchor);
    			current = true;
    			if (remount) run_all(dispose);

    			dispose = [
    				listen_dev(button0, "click", /*click_handler*/ ctx[3], false, false, false),
    				listen_dev(button1, "click", /*showMobileNav*/ ctx[1], false, false, false)
    			];
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*showNav*/ ctx[0]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty & /*showNav*/ 1) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_2$2(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(div0, t0);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (dirty & /*showNav*/ 1) {
    				toggle_class(button0, "is-active", /*showNav*/ ctx[0] == true);
    			}

    			if (dirty & /*showNav*/ 1) {
    				toggle_class(button1, "is-active", /*showNav*/ ctx[0] == true);
    			}

    			if (/*showNav*/ ctx[0]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty & /*showNav*/ 1) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block_1$4(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(div1, null);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}

    			if (dirty & /*showNav*/ 1) {
    				toggle_class(div1, "hide-nav", /*showNav*/ ctx[0] == false);
    			}

    			if (/*showNav*/ ctx[0]) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);

    					if (dirty & /*showNav*/ 1) {
    						transition_in(if_block2, 1);
    					}
    				} else {
    					if_block2 = create_if_block$8(ctx);
    					if_block2.c();
    					transition_in(if_block2, 1);
    					if_block2.m(if_block2_anchor.parentNode, if_block2_anchor);
    				}
    			} else if (if_block2) {
    				group_outros();

    				transition_out(if_block2, 1, 1, () => {
    					if_block2 = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			transition_in(if_block1);
    			transition_in(if_block2);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			transition_out(if_block1);
    			transition_out(if_block2);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (if_block0) if_block0.d();
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div1);
    			if (if_block1) if_block1.d();
    			if (detaching) detach_dev(t3);
    			if (if_block2) if_block2.d(detaching);
    			if (detaching) detach_dev(if_block2_anchor);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$q.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$q($$self, $$props, $$invalidate) {
    	let showNav = false;
    	let previousScroll = 0;

    	onMount(async () => {
    		if (window.innerWidth > 768) {
    			$$invalidate(0, showNav = true);
    		}

    		window.addEventListener("scroll", function (e) {
    			if (window.innerWidth > 768) {
    				if (window.scrollY == 0) {
    					$$invalidate(0, showNav = true);
    					previousScroll = window.scrollY;
    				}

    				if (window.scrollY > previousScroll) {
    					// if(showNav === true)  {
    					$$invalidate(0, showNav = false);

    					previousScroll = window.scrollY;
    				} else {
    					$$invalidate(0, showNav = true); // }
    					previousScroll = window.scrollY;
    				}
    			}
    		});
    	});

    	function showMobileNav() {
    		$$invalidate(0, showNav = !showNav);

    		if (showNav === true) {
    			document.body.classList.add("no-scroll");
    		} else {
    			document.body.classList.remove("no-scroll");
    		}

    		console.log("remove scroll");
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$3.warn(`<HamburgerNav> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("HamburgerNav", $$slots, []);
    	const click_handler = () => $$invalidate(0, showNav = !showNav);

    	$$self.$capture_state = () => ({
    		Link,
    		NavLinks,
    		fly,
    		fade,
    		onMount,
    		showNav,
    		previousScroll,
    		showMobileNav
    	});

    	$$self.$inject_state = $$props => {
    		if ("showNav" in $$props) $$invalidate(0, showNav = $$props.showNav);
    		if ("previousScroll" in $$props) previousScroll = $$props.previousScroll;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [showNav, showMobileNav, previousScroll, click_handler];
    }

    class HamburgerNav extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$q, create_fragment$q, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "HamburgerNav",
    			options,
    			id: create_fragment$q.name
    		});
    	}
    }

    /* src/components/home/ScrollTop.svelte generated by Svelte v3.21.0 */

    const file$q = "src/components/home/ScrollTop.svelte";

    function create_fragment$r(ctx) {
    	let button;
    	let i;
    	let t;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			i = element("i");
    			t = text(" to top");
    			attr_dev(i, "class", "fas fa-chevron-up");
    			add_location(i, file$q, 28, 48, 584);
    			attr_dev(button, "class", "montserrat svelte-1bofxpr");
    			add_location(button, file$q, 28, 0, 536);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, button, anchor);
    			append_dev(button, i);
    			append_dev(button, t);
    			if (remount) dispose();
    			dispose = listen_dev(button, "click", scrollTop, false, false, false);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$r.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function scrollTop() {
    	scroll(0, 0);
    }

    function instance$r($$self, $$props, $$invalidate) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ScrollTop> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("ScrollTop", $$slots, []);
    	$$self.$capture_state = () => ({ scrollTop });
    	return [];
    }

    class ScrollTop extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$r, create_fragment$r, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ScrollTop",
    			options,
    			id: create_fragment$r.name
    		});
    	}
    }

    /* src/components/store/Success.svelte generated by Svelte v3.21.0 */
    const file$r = "src/components/store/Success.svelte";

    function create_fragment$s(ctx) {
    	let div1;
    	let div0;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			div0.textContent = "Thank you for shopping with SRG Photography! You should receive an email shortly with your items and confirmation of your purchase.";
    			attr_dev(div0, "class", "success__msg svelte-rml2vu");
    			add_location(div0, file$r, 26, 4, 551);
    			attr_dev(div1, "class", "success alegreya svelte-rml2vu");
    			add_location(div1, file$r, 25, 0, 516);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$s.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$s($$self, $$props, $$invalidate) {
    	onMount(async () => {
    		
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Success> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Success", $$slots, []);
    	$$self.$capture_state = () => ({ onMount, cart });
    	return [];
    }

    class Success extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$s, create_fragment$s, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Success",
    			options,
    			id: create_fragment$s.name
    		});
    	}
    }

    /* src/App.svelte generated by Svelte v3.21.0 */

    const file$s = "src/App.svelte";

    // (35:3) <Router>
    function create_default_slot$6(ctx) {
    	let t0;
    	let t1;
    	let t2;
    	let t3;
    	let t4;
    	let t5;
    	let t6;
    	let current;

    	const route0 = new Route({
    			props: { exact: true, path: "/", component: Home },
    			$$inline: true
    		});

    	const route1 = new Route({
    			props: {
    				exact: true,
    				path: "/gallery",
    				component: Gallery
    			},
    			$$inline: true
    		});

    	const route2 = new Route({
    			props: {
    				exact: true,
    				path: "/videography",
    				component: Videography
    			},
    			$$inline: true
    		});

    	const route3 = new Route({
    			props: {
    				exact: true,
    				path: "/bio",
    				component: Bio
    			},
    			$$inline: true
    		});

    	const route4 = new Route({
    			props: {
    				exact: true,
    				path: "/store",
    				component: Store
    			},
    			$$inline: true
    		});

    	const route5 = new Route({
    			props: {
    				exact: true,
    				path: "/contact",
    				component: Contact
    			},
    			$$inline: true
    		});

    	const route6 = new Route({
    			props: {
    				exact: true,
    				path: "/success",
    				component: Success
    			},
    			$$inline: true
    		});

    	const route7 = new Route({
    			props: { fallback: true, component: Home },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(route0.$$.fragment);
    			t0 = space();
    			create_component(route1.$$.fragment);
    			t1 = space();
    			create_component(route2.$$.fragment);
    			t2 = space();
    			create_component(route3.$$.fragment);
    			t3 = space();
    			create_component(route4.$$.fragment);
    			t4 = space();
    			create_component(route5.$$.fragment);
    			t5 = space();
    			create_component(route6.$$.fragment);
    			t6 = space();
    			create_component(route7.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(route0, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(route1, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(route2, target, anchor);
    			insert_dev(target, t2, anchor);
    			mount_component(route3, target, anchor);
    			insert_dev(target, t3, anchor);
    			mount_component(route4, target, anchor);
    			insert_dev(target, t4, anchor);
    			mount_component(route5, target, anchor);
    			insert_dev(target, t5, anchor);
    			mount_component(route6, target, anchor);
    			insert_dev(target, t6, anchor);
    			mount_component(route7, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(route0.$$.fragment, local);
    			transition_in(route1.$$.fragment, local);
    			transition_in(route2.$$.fragment, local);
    			transition_in(route3.$$.fragment, local);
    			transition_in(route4.$$.fragment, local);
    			transition_in(route5.$$.fragment, local);
    			transition_in(route6.$$.fragment, local);
    			transition_in(route7.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(route0.$$.fragment, local);
    			transition_out(route1.$$.fragment, local);
    			transition_out(route2.$$.fragment, local);
    			transition_out(route3.$$.fragment, local);
    			transition_out(route4.$$.fragment, local);
    			transition_out(route5.$$.fragment, local);
    			transition_out(route6.$$.fragment, local);
    			transition_out(route7.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(route0, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(route1, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(route2, detaching);
    			if (detaching) detach_dev(t2);
    			destroy_component(route3, detaching);
    			if (detaching) detach_dev(t3);
    			destroy_component(route4, detaching);
    			if (detaching) detach_dev(t4);
    			destroy_component(route5, detaching);
    			if (detaching) detach_dev(t5);
    			destroy_component(route6, detaching);
    			if (detaching) detach_dev(t6);
    			destroy_component(route7, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$6.name,
    		type: "slot",
    		source: "(35:3) <Router>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$t(ctx) {
    	let div1;
    	let div0;
    	let t0;
    	let t1;
    	let current;
    	const hamburgernav = new HamburgerNav({ props: { Router }, $$inline: true });
    	const scrolltop = new ScrollTop({ $$inline: true });

    	const router = new Router({
    			props: {
    				$$slots: { default: [create_default_slot$6] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			create_component(hamburgernav.$$.fragment);
    			t0 = space();
    			create_component(scrolltop.$$.fragment);
    			t1 = space();
    			create_component(router.$$.fragment);
    			attr_dev(div0, "class", "small");
    			add_location(div0, file$s, 31, 2, 1054);
    			attr_dev(div1, "id", "app");
    			add_location(div1, file$s, 30, 1, 1037);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			mount_component(hamburgernav, div0, null);
    			append_dev(div0, t0);
    			mount_component(scrolltop, div0, null);
    			append_dev(div0, t1);
    			mount_component(router, div0, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const hamburgernav_changes = {};
    			if (dirty & /*Router*/ 0) hamburgernav_changes.Router = Router;
    			hamburgernav.$set(hamburgernav_changes);
    			const router_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				router_changes.$$scope = { dirty, ctx };
    			}

    			router.$set(router_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(hamburgernav.$$.fragment, local);
    			transition_in(scrolltop.$$.fragment, local);
    			transition_in(router.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(hamburgernav.$$.fragment, local);
    			transition_out(scrolltop.$$.fragment, local);
    			transition_out(router.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			destroy_component(hamburgernav);
    			destroy_component(scrolltop);
    			destroy_component(router);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$t.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$t($$self, $$props, $$invalidate) {
    	onMount(async () => {
    		aos.init();

    		// let about = {id: about}
    		Router.hashchange = true;
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("App", $$slots, []);

    	$$self.$capture_state = () => ({
    		AOS: aos,
    		Router,
    		Route,
    		Home,
    		About,
    		Bio,
    		Gallery,
    		Videography,
    		Store,
    		Contact,
    		HamburgerNav,
    		ScrollTop,
    		Success,
    		onMount
    	});

    	return [];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$t, create_fragment$t, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$t.name
    		});
    	}
    }

    var app = new App({
      target: document.body
    });

    return app;

}());
