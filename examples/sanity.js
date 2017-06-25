import {Subject} from 'rxjs';

const pub = new Subject()

const onNext = (event) => console.log('Event:', event)

const subscription = pub.subscribe(
  onNext
)

pub.next(1)
pub.next(2)
subscription.unsubscribe()
pub.next(3)


// import Rx from 'rxjs'

// const source = Rx.Observable.create(observer => {
//   // Yield a single value and complete
//   observer.onNext(42);
//   observer.onCompleted();

//   // Any cleanup logic might go here
//   return () => console.log('disposed')
// });

// var subscription = source.subscribe(
//   x => console.log('onNext: %s', x),
//   e => console.log('onError: %s', e),
//   () => console.log('onCompleted'));

// // => onNext: 42
// // => onCompleted

// subscription.dispose();
// // => disposed

