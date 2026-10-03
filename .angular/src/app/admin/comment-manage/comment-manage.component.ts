import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AppService } from '../../utils/app.service';
import { LocalService } from '../../utils/local.service';
import { RequestModel } from '../../utils/interface';
import { ConstantData } from '../../utils/constant-data';
import { NewsComment } from '../../models/news.model';

@Component({
  selector: 'app-comment-manage',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './comment-manage.component.html',
  styleUrls: ['./comment-manage.component.css']
})
export class CommentManageComponent implements OnInit {
  comments: NewsComment[] = [];

  constructor(
    public appService: AppService,
    private localService: LocalService
  ) {}

  ngOnInit(): void {
    this.loadComments();
  }

  loadComments(): void {
    this.appService.getPublicComments(0).subscribe({
      next: (res: any) => {
        if (res && res.data) {
          this.comments = res.data.map((c: any) => ({
            id: String(c.CommentId),
            articleId: String(c.ArticleId),
            userName: c.UserName,
            userEmail: c.UserEmail || '',
            commentText: c.CommentText,
            createdAt: c.CreatedOn,
            isApproved: true
          }));
        }
      },
      error: () => {}
    });
  }

  deleteComment(id: string): void {
    if (confirm('Are you sure you want to delete this comment?')) {
      const payload = { CommentId: parseInt(id) };
      const requestModel: RequestModel = {
        request: this.localService.encrypt(JSON.stringify(payload)).toString()
      };

      this.appService.deleteComment(requestModel).subscribe({
        next: (res: any) => {
          if (res && (res.Message === 'Success' || res.Message === ConstantData.SuccessMessage)) {
            alert('Comment deleted successfully!');
            this.loadComments();
          } else {
            alert(res?.Message || 'Failed to delete comment');
          }
        },
        error: () => {
          alert('Error deleting comment');
        }
      });
    }
  }
}
