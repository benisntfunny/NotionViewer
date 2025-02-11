import { Component, OnInit, OnDestroy } from '@angular/core';
import { Location } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { environment } from '../environments/environment';
import { Title } from '@angular/platform-browser';
@Component({
  selector: 'app-root',
  standalone: true,
  template: `
    <div>
      <iframe
        [src]="safeIframeUrl"
        frameborder="0"
        allowfullscreen
        (load)="onIframeLoad($event)"
      ></iframe>
    </div>
  `,
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {
  siteTitle = environment.siteTitle;
  defaultPath = environment.defaultPath;
  path: string = this.defaultPath;
  baseUrl = environment.baseUrl;
  safeIframeUrl: SafeResourceUrl;
  messageListener: ((event: MessageEvent) => void) | undefined = undefined;

  constructor(
    private location: Location,
    private sanitizer: DomSanitizer,
    private titleService: Title
  ) {
    this.safeIframeUrl = this.sanitizeUrl(`${this.baseUrl}${this.path}`);
    this.setTitle(this.siteTitle);
  }

  setTitle(newTitle: string) {
    this.titleService.setTitle(newTitle);
  }

  ngOnInit() {
    const currentPath = this.location.path();
    if (currentPath && currentPath !== this.defaultPath) {
      this.path = currentPath;
      this.updateIframeUrl();
    } else {
      this.location.replaceState(''); // Blank URL bar when on default path
    }

    this.messageListener = (event: MessageEvent) => {
      if (event.data && event.data.path) {
        const newPath = event.data.path;
        if (newPath !== this.path) {
          this.path = newPath;
          this.updateIframeUrl();
          this.updateBrowserUrl();
        }
      }
    };
  }

  ngOnDestroy() {
    if (this.messageListener) {
      window.removeEventListener('message', this.messageListener);
    }
  }

  onIframeLoad(event: Event) {
    const iframe = event.target as HTMLIFrameElement;
    try {
      const iframeLoc = iframe.contentWindow?.location;
      if (iframeLoc && iframeLoc.pathname) {
        const newPath = iframeLoc.pathname + iframeLoc.search;
        if (newPath !== this.path) {
          this.path = newPath;
          this.updateIframeUrl();
          this.updateBrowserUrl();
        }
      }
    } catch (e) {
      // Ignore cross-origin errors
    }
  }

  updateIframeUrl() {
    this.safeIframeUrl = this.sanitizeUrl(`${this.baseUrl}${this.path}`);
  }

  updateBrowserUrl() {
    if (this.path === this.defaultPath) {
      this.location.replaceState(''); // Clears path in URL bar
    } else {
      this.location.replaceState(this.path);
    }
  }

  sanitizeUrl(url: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
}
