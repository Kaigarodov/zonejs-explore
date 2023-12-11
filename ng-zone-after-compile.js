var NgZone = class _NgZone {
    constructor({
        enableLongStackTrace = false,
        shouldCoalesceEventChangeDetection = false,
        shouldCoalesceRunChangeDetection = false
    }) {
        this.hasPendingMacrotasks = false;
        this.hasPendingMicrotasks = false;
        this.isStable = true;
        this.onUnstable = new EventEmitter(false);
        this.onMicrotaskEmpty = new EventEmitter(false);
        this.onStable = new EventEmitter(false);
        this.onError = new EventEmitter(false);
        if (typeof Zone == "undefined") {
            throw new RuntimeError(908, ngDevMode && `In this configuration Angular requires Zone.js`);
        }
        Zone.assertZonePatched();
        const self = this;
        self._nesting = 0;
        self._outer = self._inner = Zone.current;
        if (ngDevMode) {
            self._inner = self._inner.fork(new AsyncStackTaggingZoneSpec("Angular"));
        }
        if (Zone["TaskTrackingZoneSpec"]) {
            self._inner = self._inner.fork(new Zone["TaskTrackingZoneSpec"]());
        }
        if (enableLongStackTrace && Zone["longStackTraceZoneSpec"]) {
            self._inner = self._inner.fork(Zone["longStackTraceZoneSpec"]);
        }
        self.shouldCoalesceEventChangeDetection = !shouldCoalesceRunChangeDetection && shouldCoalesceEventChangeDetection;
        self.shouldCoalesceRunChangeDetection = shouldCoalesceRunChangeDetection;
        self.lastRequestAnimationFrameId = -1;
        self.nativeRequestAnimationFrame = getNativeRequestAnimationFrame().nativeRequestAnimationFrame;
        forkInnerZoneWithAngularBehavior(self);
    }
    /**
      This method checks whether the method call happens within an Angular Zone instance.
    */
    static isInAngularZone() {
        return typeof Zone !== "undefined" && Zone.current.get("isAngularZone") === true;
    }
    /**
      Assures that the method is called within the Angular Zone, otherwise throws an error.
    */
    static assertInAngularZone() {
        if (!_NgZone.isInAngularZone()) {
            throw new RuntimeError(909, ngDevMode && "Expected to be in Angular Zone, but it is not!");
        }
    }
    /**
      Assures that the method is called outside of the Angular Zone, otherwise throws an error.
    */
    static assertNotInAngularZone() {
        if (_NgZone.isInAngularZone()) {
            throw new RuntimeError(909, ngDevMode && "Expected to not be in Angular Zone, but it is!");
        }
    }
    /**
     * Executes the `fn` function synchronously within the Angular zone and returns value returned by
     * the function.
     *
     * Running functions via `run` allows you to reenter Angular zone from a task that was executed
     * outside of the Angular zone (typically started via {@link #runOutsideAngular}).
     *
     * Any future tasks or microtasks scheduled from within this function will continue executing from
     * within the Angular zone.
     *
     * If a synchronous error happens it will be rethrown and not reported via `onError`.
     */
    run(fn, applyThis, applyArgs) {
        return this._inner.run(fn, applyThis, applyArgs);
    }
    /**
     * Executes the `fn` function synchronously within the Angular zone as a task and returns value
     * returned by the function.
     *
     * Running functions via `run` allows you to reenter Angular zone from a task that was executed
     * outside of the Angular zone (typically started via {@link #runOutsideAngular}).
     *
     * Any future tasks or microtasks scheduled from within this function will continue executing from
     * within the Angular zone.
     *
     * If a synchronous error happens it will be rethrown and not reported via `onError`.
     */
    runTask(fn, applyThis, applyArgs, name) {
        const zone = this._inner;
        const task = zone.scheduleEventTask("NgZoneEvent: " + name, fn, EMPTY_PAYLOAD, noop2, noop2);
        try {
            return zone.runTask(task, applyThis, applyArgs);
        } finally {
            zone.cancelTask(task);
        }
    }
    /**
     * Same as `run`, except that synchronous errors are caught and forwarded via `onError` and not
     * rethrown.
     */
    runGuarded(fn, applyThis, applyArgs) {
        return this._inner.runGuarded(fn, applyThis, applyArgs);
    }
    /**
     * Executes the `fn` function synchronously in Angular's parent zone and returns value returned by
     * the function.
     *
     * Running functions via {@link #runOutsideAngular} allows you to escape Angular's zone and do
     * work that
     * doesn't trigger Angular change-detection or is subject to Angular's error handling.
     *
     * Any future tasks or microtasks scheduled from within this function will continue executing from
     * outside of the Angular zone.
     *
     * Use {@link #run} to reenter the Angular zone and do work that updates the application model.
     */
    runOutsideAngular(fn) {
        return this._outer.run(fn);
    }
};