import './style.css'
import 'zone.js';
import { setupCounter } from './counter.ts'

//explore
//https://angular.io/guide/zone#zones-and-async-lifecycle-hooks


console.log(Zone.current)

let rootZone: Zone = Zone.current
let myZone = Zone.current.fork({
  name: 'myZone',
  onScheduleTask: function (delegate, curr, target, task) {
    console.log(arguments);
    return delegate.scheduleTask(target, task);
  }
});

function SomeFunctionWithPromise() {
  new Promise((resolve) => {
    setTimeout(() => { resolve('1111') }, 5000)
  }).then(console.log)
}

myZone.run(() => {
  setTimeout(() => {
    console.log('inside zone');
    SomeFunctionWithPromise();
  })
})

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div>
    <h1>Test zone.js</h1>
    <div class="card">
      <button id="counter" type="button"></button>
    </div>
    <p class="read-the-docs">
      Click on the Vite and TypeScript logos to learn more
    </p>
  </div>
`

setupCounter(document.querySelector<HTMLButtonElement>('#counter')!)
