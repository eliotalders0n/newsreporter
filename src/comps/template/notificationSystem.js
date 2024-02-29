import React, { useEffect } from 'react';
import firebase from "./../../firebase";
import { toast } from 'react-toastify';

const NotificationSystem = ({ }) => {
  useEffect(() => {
    const fetchUserArticles = async () => {
      try {
        // Access Firestore collection and listen for changes
        const articlesRef = firebase.firestore().collection('Articles');
        const query = articlesRef.where('author', '==', firebase.auth().currentUser.uid);

        const unsubscribe = query.onSnapshot((snapshot) => {
          snapshot.docChanges().forEach((change) => {
            if (change.type === 'modified') {
              // Display notification for modified articles
              const articleData = change.doc.data();
              toast.info(`Status of article "${articleData.title}" changed to ${articleData.status}`);
            }
          });
        });

        // Cleanup function to unsubscribe from snapshot listener
        return () => unsubscribe();
      } catch (error) {
        console.error('Error fetching user articles:', error);
      }
    };

    fetchUserArticles();
  }, []);

  return null; // Notification component doesn't render anything visible
};

export default NotificationSystem;
