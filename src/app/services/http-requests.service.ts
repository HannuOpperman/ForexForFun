import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BaseService } from './base.service';

@Injectable({
  providedIn: 'root'
})
export class HttpRequestsService {

  apiKey = 'K9izZeK9cwB2rKS86EalHszK';        // TODO For the tester, if you have a different key
  apiBaseUrl = 'https://fcsapi.com/api-v3/forex/';
  middlewareUrl = 'http://localhost:3000/';   // TODO For the tester, if you have a different port selected on the middleware
  getComparisonSymbolUrl = 'getComparisonList';
  getUniqueSymbolUrl = 'getUniqueSymbols';
  getProfilesUrl = 'getCurrencyProfiles';
  forexListUrl = 'list?type=forex';
  currencyListUrl = 'profile?symbol=';
  currencyConversionUrl = 'converter?';
  currencyPriceUrl = 'latest?symbol=';
  historicPriceUrl = 'history?symbol=';
  accessKeySuffix = '&access_key=' + this.apiKey;
  
  constructor(
    private http: HttpClient,
    private baseService: BaseService,
  ) { }

  async getComparisonSymbols() {
    let requestUrl = this.middlewareUrl + this.getComparisonSymbolUrl;
    let headers = new HttpHeaders();
    headers = headers.set('Content-Type', 'application/json; charset=utf-8')
                      .set('Access-Control-Allow-Origin', '*');
    return new Promise((resolve, reject) => {
      this.http.get(requestUrl, { headers }).subscribe((response: any) => {
        if (this.baseService.isArrayAndHasValues(response)) {
          return resolve(response);
        }
        else {
          console.log(response);
        }
      });
    });
    
  }

  async getCurrencyProfiles() {
    let requestUrl = this.middlewareUrl + this.getProfilesUrl
    let headers = new HttpHeaders();
    headers = headers.set('Content-Type', 'application/json; charset=utf-8')
                      .set('Access-Control-Allow-Origin', '*');
    return new Promise((resolve, reject) => {
      this.http.get(requestUrl, { headers }).subscribe((response: any) => {
        if (this.baseService.isArrayAndHasValues(response)) {
          return resolve(response);
        }
        else {
          console.log(response);
        }
      });
    });
  }

  async getBaseSymbols(symbolList: string) {
    let connectionUrl = this.apiBaseUrl + this.currencyListUrl + symbolList + this.accessKeySuffix;
    this.http.get(connectionUrl).subscribe((response: any) => {
      if (response && response.hasOwnProperty('code') && response.code === 200) {
        if (response.hasOwnProperty('response') &&
            response.response &&
            response.response.hasOwnProperty('length') &&
            response.response.length > 0) {
              localStorage.setItem('baseCurrencyList', JSON.stringify(response.response));
              return response;
        }
      }
      else {
        console.log(response);
      }
    });
  }

  currencyConverter(currencyDetails: any) {
    let urlAddition = '';
    if (currencyDetails) {
      if (currencyDetails.currencyCode) {
        urlAddition = 'symbol=' + currencyDetails.currencyCode
      }
      if (currencyDetails.amount) {
        urlAddition += '&amount=' + currencyDetails.amount
      }
    }
    let connectionUrl = this.apiBaseUrl + this.currencyConversionUrl + urlAddition + this.accessKeySuffix;
    this.http.get(connectionUrl).subscribe((response: any) => {
      if (response && response.hasOwnProperty('code') && response.code === 200) {
        if (response.hasOwnProperty('response') &&
            this.baseService.isArrayAndHasValues(response.response)) {
              return response;
        }
      }
      else {
        console.log(response);
      }
    });
  }

  currencyAmounts(currencyCode: any, dateData: any) {
    let connectionUrl;
    if (dateData.dateDifference < 0) {
      connectionUrl = this.middlewareUrl +
                          'getHistoricValue?' +
                          'currencyCode=' + currencyCode +
                          '&selectedDate=' + dateData.selectedDate;         
    }
    else {
      connectionUrl = this.apiBaseUrl +
                          this.currencyPriceUrl +
                          currencyCode +
                          this.accessKeySuffix;
    }
    return this.http.get(connectionUrl);
  }
}
