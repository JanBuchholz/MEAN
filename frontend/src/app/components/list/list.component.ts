import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import * as io from 'socket.io-client';

import { Issue } from '../../issue.model';
import { IssueService } from '../../issue.service';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css']
})
export class ListComponent implements OnInit {

  issues: Issue[];
  displayedColumns = ['title', 'responsible', 'severity', 'status', 'actions'];

  notice = '';

  constructor(private issueService: IssueService, private router: Router) {

    // Websocket erzeugen
    const socket = io('http://localhost:4001');
    socket.on('change', (data) => {

      if (data == 'check') {        
        console.log('Detected data change. Reloading ...');
        this.fetchIssues();
      }
    });
  }

  ngOnInit() {
    this.fetchIssues();
  }

  fetchIssues() {
    this.issueService
      .getIssues()
      .subscribe((data: Issue[]) => {
        this.issues = data;
        this.notice = '';
      });
  }

  editIssue(id) {
    this.router.navigate([`/edit/${id}`]);
  }

  deleteIssue(id) {
    this.issueService.deleteIssue(id).subscribe(() => {
      this.fetchIssues();
    });
  }

  addQuickIssue() {
    this.issueService.addQuickIssue().subscribe(() => {
      this.fetchIssues();
    });
  }

}
