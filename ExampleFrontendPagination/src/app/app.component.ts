import { Component, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MatPaginator, MatPaginatorIntl, PageEvent } from '@angular/material/paginator';
import { LogsPaginator } from './logs-paginator';

interface ILog {
  timestamp: string;
  text: string;
}

interface IPagedResult<T> {
  items: T[];
  isFinalPage: boolean;
  continuationToken: string;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers: [
    {
      provide: MatPaginatorIntl,
      useClass: LogsPaginator
    }
  ]
})
export class AppComponent {
  pageSize = 5;

  logsTableSource: MatTableDataSource<ILog> = new MatTableDataSource<ILog>();
  displayedColumns = ['date', 'text'];

  @ViewChild(MatPaginator) paginator: MatPaginator;
  private cachedLogs: ILog[] = [];
  private cachedIndexes: number[] = [];
  private continuationToken = '';

  constructor(private http: HttpClient) {
  }

  public async ngAfterViewInit() {
    this.paginator.page.subscribe(this.pageChanged.bind(this)); // Start listeting page changes.
    await this.loadLogs(); // Preload logs.
  }

  // This method will load logs and cache them.
  private async loadLogs() {
    const res = await this.getLogs(this.paginator.pageSize, this.continuationToken).toPromise();

    this.cachedIndexes.push(this.paginator.pageIndex);
    this.cachedLogs.push(...res.items);
    this.paginator.length = res.isFinalPage ? this.cachedLogs.length : this.cachedLogs.length + 1;
    this.continuationToken = res.continuationToken;

    this.redrawTable();
  }

  // Redraws table based on page index and page size.
  private redrawTable() {
    const start = this.paginator.pageIndex * this.paginator.pageSize;
    const end = start + this.paginator.pageSize;
    this.logsTableSource.data = this.cachedLogs.slice(start, end);
  }

  private async pageChanged(event: PageEvent) {
    // Size of page has changed, everything what we previously cached is not valid.
    if (this.pageSize !== this.paginator.pageSize) {
      this.pageSize = this.paginator.pageSize;
      await this.refresh();
      return;
    }

    if (event.previousPageIndex < event.pageIndex && this.cachedIndexes.indexOf(event.pageIndex) === -1) {
      await this.loadLogs(); // Move forward.
    } else {
      this.redrawTable(); // Move backward.
    }
  }

  // Clears table cache and load new logs.
  private async refresh() {
    this.cachedLogs = [];
    this.cachedIndexes = [];
    this.continuationToken = '';
    this.paginator.pageIndex = 0;

    await this.loadLogs();
  }

  // Makes API call.
  private getLogs(pageSize: number, continuationToken?: string): Observable<IPagedResult<ILog>> {
    const params = {};
    params['pageSize'] = pageSize;

    if (continuationToken) {
      params['continuationToken'] = continuationToken;
    }

    return this.http.get<IPagedResult<ILog>>('http://localhost:7071/api/logs', { params });
  }
}
