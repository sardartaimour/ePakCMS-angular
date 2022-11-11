import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, TemplateRef, ViewChild, ViewContainerRef, ViewEncapsulation } from '@angular/core';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { MatButton } from '@angular/material/button';
import { Subject, takeUntil } from 'rxjs';
import { Notification } from 'app/layout/common/notifications/notifications.types';
import { NotificationsService } from 'app/layout/common/notifications/notifications.service';

import * as moment from 'moment';

export const notifications = [
    {
        id         : '493190c9-5b61-4912-afe5-78c21f1044d7',
        icon       : 'heroicons_solid:star',
        title      : 'Daily challenges',
        description: 'Your submission has been accepted',
        time       : moment().subtract(25, 'minutes').toISOString(), // 25 minutes ago
        read       : false
    },
    {
        id         : '6e3e97e5-effc-4fb7-b730-52a151f0b641',
        image      : 'assets/images/avatars/male-04.jpg',
        description: '<strong>Leo Gill</strong> added you to <em>Top Secret Project</em> group and assigned you as a <em>Project Manager</em>',
        time       : moment().subtract(50, 'minutes').toISOString(), // 50 minutes ago
        read       : true,
        link       : '/dashboards/project',
        useRouter  : true
    },
    {
        id         : 'b91ccb58-b06c-413b-b389-87010e03a120',
        icon       : 'heroicons_solid:mail',
        title      : 'Mailbox',
        description: 'You have 15 unread mails across 3 mailboxes',
        time       : moment().subtract(3, 'hours').toISOString(), // 3 hours ago
        read       : false,
        link       : '/dashboards/project',
        useRouter  : true
    },
    {
        id         : '541416c9-84a7-408a-8d74-27a43c38d797',
        icon       : 'heroicons_solid:refresh',
        title      : 'Cron jobs',
        description: 'Your <em>Docker container</em> is ready to publish',
        time       : moment().subtract(5, 'hours').toISOString(), // 5 hours ago
        read       : false,
        link       : '/dashboards/project',
        useRouter  : true
    },
    {
        id         : 'ef7b95a7-8e8b-4616-9619-130d9533add9',
        image      : 'assets/images/avatars/male-06.jpg',
        description: '<strong>Roger Murray</strong> accepted your friend request',
        time       : moment().subtract(7, 'hours').toISOString(), // 7 hours ago
        read       : true,
        link       : '/dashboards/project',
        useRouter  : true
    },
    {
        id         : 'eb8aa470-635e-461d-88e1-23d9ea2a5665',
        image      : 'assets/images/avatars/female-04.jpg',
        description: '<strong>Sophie Stone</strong> sent you a direct message',
        time       : moment().subtract(9, 'hours').toISOString(), // 9 hours ago
        read       : true,
        link       : '/dashboards/project',
        useRouter  : true
    },
    {
        id         : 'b85c2338-cc98-4140-bbf8-c226ce4e395e',
        icon       : 'heroicons_solid:mail',
        title      : 'Mailbox',
        description: 'You have 3 new mails',
        time       : moment().subtract(1, 'day').toISOString(), // 1 day ago
        read       : true,
        link       : '/dashboards/project',
        useRouter  : true
    },
    {
        id         : '8f8e1bf9-4661-4939-9e43-390957b60f42',
        icon       : 'heroicons_solid:star',
        title      : 'Daily challenges',
        description: 'Your submission has been accepted and you are ready to sign-up for the final assigment which will be ready in 2 days',
        time       : moment().subtract(3, 'days').toISOString(), // 3 days ago
        read       : true,
        link       : '/dashboards/project',
        useRouter  : true
    },
    {
        id         : '30af917b-7a6a-45d1-822f-9e7ad7f8bf69',
        icon       : 'heroicons_solid:refresh',
        title      : 'Cron jobs',
        description: 'Your Vagrant container is ready to download',
        time       : moment().subtract(4, 'day').toISOString(), // 4 days ago
        read       : true,
        link       : '/dashboards/project',
        useRouter  : true
    }
];

@Component({
    selector       : 'notifications',
    templateUrl    : './notifications.component.html',
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    exportAs       : 'notifications'
})
export class NotificationsComponent implements OnInit, OnDestroy
{
    @ViewChild('notificationsOrigin') private _notificationsOrigin: MatButton;
    @ViewChild('notificationsPanel') private _notificationsPanel: TemplateRef<any>;

    notifications: Notification[];
    unreadCount: number = 0;
    private _overlayRef: OverlayRef;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    /**
     * Constructor
     */
    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _notificationsService: NotificationsService,
        private _overlay: Overlay,
        private _viewContainerRef: ViewContainerRef
    )
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void
    {

        // Load the notifications
        this.notifications = notifications;

        // Calculate the unread count
        this._calculateUnreadCount();

        // Mark for check
        this._changeDetectorRef.markForCheck();
        
        // // Subscribe to notification changes
        // this._notificationsService.notifications$
        //     .pipe(takeUntil(this._unsubscribeAll))
        //     .subscribe((notifications: Notification[]) => {

        //         // Load the notifications
        //         this.notifications = notifications;

        //         // Calculate the unread count
        //         this._calculateUnreadCount();

        //         // Mark for check
        //         this._changeDetectorRef.markForCheck();
        //     });
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void
    {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();

        // Dispose the overlay
        if ( this._overlayRef )
        {
            this._overlayRef.dispose();
        }
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Open the notifications panel
     */
    openPanel(): void
    {
        // Return if the notifications panel or its origin is not defined
        if ( !this._notificationsPanel || !this._notificationsOrigin )
        {
            return;
        }

        // Create the overlay if it doesn't exist
        if ( !this._overlayRef )
        {
            this._createOverlay();
        }

        // Attach the portal to the overlay
        this._overlayRef.attach(new TemplatePortal(this._notificationsPanel, this._viewContainerRef));
    }

    /**
     * Close the notifications panel
     */
    closePanel(): void
    {
        this._overlayRef.detach();
    }

    /**
     * Mark all notifications as read
     */
    markAllAsRead(): void
    {
        // Mark all as read
        this._notificationsService.markAllAsRead().subscribe();
    }

    /**
     * Toggle read status of the given notification
     */
    toggleRead(notification: Notification): void
    {
        // Toggle the read status
        notification.read = !notification.read;

        // Update the notification
        this._notificationsService.update(notification.id, notification).subscribe();
    }

    /**
     * Delete the given notification
     */
    delete(notification: Notification): void
    {
        // Delete the notification
        this._notificationsService.delete(notification.id).subscribe();
    }

    /**
     * Track by function for ngFor loops
     *
     * @param index
     * @param item
     */
    trackByFn(index: number, item: any): any
    {
        return item.id || index;
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Private methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Create the overlay
     */
    private _createOverlay(): void
    {
        // Create the overlay
        this._overlayRef = this._overlay.create({
            hasBackdrop     : true,
            backdropClass   : 'fuse-backdrop-on-mobile',
            scrollStrategy  : this._overlay.scrollStrategies.block(),
            positionStrategy: this._overlay.position()
                                  .flexibleConnectedTo(this._notificationsOrigin._elementRef.nativeElement)
                                  .withLockedPosition(true)
                                  .withPush(true)
                                  .withPositions([
                                      {
                                          originX : 'start',
                                          originY : 'bottom',
                                          overlayX: 'start',
                                          overlayY: 'top'
                                      },
                                      {
                                          originX : 'start',
                                          originY : 'top',
                                          overlayX: 'start',
                                          overlayY: 'bottom'
                                      },
                                      {
                                          originX : 'end',
                                          originY : 'bottom',
                                          overlayX: 'end',
                                          overlayY: 'top'
                                      },
                                      {
                                          originX : 'end',
                                          originY : 'top',
                                          overlayX: 'end',
                                          overlayY: 'bottom'
                                      }
                                  ])
        });

        // Detach the overlay from the portal on backdrop click
        this._overlayRef.backdropClick().subscribe(() => {
            this._overlayRef.detach();
        });
    }

    /**
     * Calculate the unread count
     *
     * @private
     */
    private _calculateUnreadCount(): void
    {
        let count = 0;

        if ( this.notifications && this.notifications.length )
        {
            count = this.notifications.filter(notification => !notification.read).length;
        }

        this.unreadCount = count;
    }
}
