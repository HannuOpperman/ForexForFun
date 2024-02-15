import { Component } from '@angular/core';
import { BaseService } from 'src/app/services/base.service';
import { HttpRequestsService } from 'src/app/services/http-requests.service';
import * as moment from 'moment';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {

  selectedAmount = '1';
  sortedResponseList: any;
  symbolList: any;
  sorted: any = false;
  selectedSymbol: any;
  selectedExchange: any;
  exchangeCode:any;
  currentExchange: any;
  output: any;
  today = moment().format('yyyy-MM-DD');
  selectedDate: any = this.today;

  constructor(
    private httpRequests: HttpRequestsService,
    private baseService: BaseService,
  ) {
    this.getCurrencyList();
  }

  async getCurrencyList() {
    let currencyProfiles: any = await this.httpRequests.getCurrencyProfiles();
    let comparisonSymbols: any = await this.httpRequests.getComparisonSymbols();
    
    let array: any = [];
    this.symbolList = [];
    let mainCurrency;
    let secondaryCurrency;
    
    if (this.baseService.isArrayAndHasValues(currencyProfiles) &&
        this.baseService.isArrayAndHasValues(comparisonSymbols)) {
      for (let i = 0; i < comparisonSymbols.length; i++) {
        let symbolName = comparisonSymbols[i].Symbol.split('/');
        mainCurrency = currencyProfiles.filter((item: any) => item.ShortName === symbolName[0])[0];
        secondaryCurrency = currencyProfiles.filter((item: any) => item.ShortName === symbolName[1])[0];
        if (!array[symbolName[0]]) {
          if (mainCurrency) {
            array[symbolName[0]] = [];
            this.symbolList.push({
              symbol: symbolName[0],
              name: mainCurrency.Name
            });
          }
        }
        if (mainCurrency && secondaryCurrency) {
          array[symbolName[0]].push({
            exchangeSymbolItem: comparisonSymbols[i],
            secondarySymbolShortName: symbolName[1],
            mainCurrency,
            secondaryCurrency 
          });
        }
      }
      this.sortedResponseList = array;
      this.sorted = true;
    }
  }

  checkDateDifference() {
    return moment(this.today).isAfter(moment(this.selectedDate));
  }

  calculateDateDifference() {
    return moment(this.selectedDate).diff(moment(this.today), 'days');
  }

  calculateResponse(response: any, dateDifference: any) {
    this.currentExchange = response.c;
    this.currentExchange = Number(response.c) * Number(this.selectedAmount);
    this.currentExchange = Math.round((this.currentExchange + Number.EPSILON) * 100) / 100;
    this.output = this.selectedAmount + ' ' +
                  this.selectedSymbol +
                  (dateDifference < 0 ? ' was' : ' is') +
                  ' equal to ' +
                  this.currentExchange + ' ' +
                  this.selectedExchange + ' ' +
                  (dateDifference < 0 ? ' on ' + this.selectedDate : '');
  }

  checkExchange() {
    this.exchangeCode = '';
    if (this.selectedSymbol && this.selectedExchange) {
      this.exchangeCode = this.selectedSymbol + '/' + this.selectedExchange;
      let dateDifference = this.calculateDateDifference();
        let dateData = {
          dateDifference,
          today: this.today,
          selectedDate: this.selectedDate
        };
        this.httpRequests.currencyAmounts(this.exchangeCode, dateData).subscribe((response: any) => {
          if (response && response.hasOwnProperty('code') && response.code === 200) {
            if (response.hasOwnProperty('response') &&
                this.baseService.isArrayAndHasValues(response.response) &&
                response.response[0] &&
                response.response[0]) {
              this.calculateResponse(response.response[0], dateDifference);
            }
          }
          else {
            if (this.baseService.isArrayAndHasValues(response)) {
              response[0].c = response[0].Price;
              this.calculateResponse(response[0], dateDifference);
            }
            else {
              this.output = 'We do not have a record for that day';
            }
          }
        });
    }
  }

}
