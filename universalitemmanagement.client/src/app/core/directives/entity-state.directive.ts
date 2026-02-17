import {
  Directive,
  Input,
  TemplateRef,
  ViewContainerRef,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
  EmbeddedViewRef
} from '@angular/core';
import { Observable, Subscription } from 'rxjs';

@Directive({
  selector: '[appEntityState]',
  standalone: true
})
export class EntityStateDirective<T> implements OnInit, OnDestroy {
  private subscription?: Subscription;
  private viewRef?: EmbeddedViewRef<EntityStateContext<T>>;

  @Input('appEntityState') state$!: Observable<T>;

  constructor(
    private templateRef: TemplateRef<EntityStateContext<T>>,
    private viewContainer: ViewContainerRef,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.subscription = this.state$.subscribe(state => {
      if (!this.viewRef) {
        this.viewRef = this.viewContainer.createEmbeddedView(
          this.templateRef,
          new EntityStateContext<T>(state)
        );
      } else {
        this.viewRef.context.$implicit = state;
        this.viewRef.context.appEntityState = state;
        this.viewRef.markForCheck();
      }
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  static ngTemplateContextGuard<T>(
    dir: EntityStateDirective<T>,
    ctx: unknown
  ): ctx is EntityStateContext<T> {
    return true;
  }
}

export class EntityStateContext<T> {
  constructor(public $implicit: T, public appEntityState: T = $implicit) {}
}
