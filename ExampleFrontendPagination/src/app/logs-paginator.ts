import { Injectable } from '@angular/core';
import { MatPaginatorIntl } from '@angular/material/paginator';

@Injectable()
export class LogsPaginator extends MatPaginatorIntl {
    public getRangeLabel = function (page: number, pageSize: number, length: number) {
        return '';
    };
}