import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class BaseService {

  constructor() { }

  isArrayAndHasValues(array: []) {
    return array &&
    array.hasOwnProperty('length') &&
    array.length &&
    array.length > 0
  }
}
