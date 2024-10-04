import React from 'react'
import axios from 'axios'

function Notifications({ notifications, setNotifications }) {
    const markNotificationAsRead = (notificationId) => {
        axios.put(`/api/notifications/${notificationId}`, { read: true })
            .then(response => {
                setNotifications(prevNotifications =>
                    prevNotifications.map(notification => {
                        if (notification.notification_id === notificationId) {
                            return { ...notification, read: true }
                        }
                        return notification
                    })
                )
            })
            .catch(error => {
                console.error('Error marking notification as read:', error)
            });
    };

    const markAllNotificationsAsRead = () => {
        notifications.forEach(notification => {
            if (!notification.read) {
                markNotificationAsRead(notification.notification_id)
            }
        })
    }

    const handleModalClose = () => {
        markAllNotificationsAsRead()
    }

    return (
        <div className="modal fade" id="notificationModal" tabIndex="-1" aria-labelledby="notificationModalLabel" aria-hidden="true">
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title" id="notificationModalLabel">Notifications</h5>
                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div className="modal-body">
                        {notifications.length > 0 ? (
                            <ul className="list-group">
                                {notifications.map((notification, index) => (
                                    <li key={index} className="list-group-item">
                                        <small>{new Date(notification.created_at).toLocaleString()}</small><br />
                                        {notification.message}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p>No notifications available.</p>
                        )}
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" data-bs-dismiss="modal" onClick={handleModalClose}>Close</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Notifications
