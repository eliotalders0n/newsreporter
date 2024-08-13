import { useState, useEffect } from "react";
import firebase from "../../firebase";

const useGetMinistry = (docId) => {
  const [doc, setDoc] = useState(null);

  useEffect(() => {
    if (!docId) return;

    const unsubscribe = firebase
      .firestore()
      .collection("Ministries")
      .doc(docId)
      .onSnapshot(
        (snapshot) => {
          if (snapshot.exists) {
            console.log("Document data:", snapshot.data()); // Log document data
            setDoc({
              id: snapshot.id,
              ...snapshot.data(),
            });
          } else {
            console.log("No such document!"); // Document does not exist
            setDoc(null);
          }
        },
        (error) => {
          console.error("Error fetching data:", error);
        }
      );

    return () => unsubscribe();
  }, [docId]);

  return { doc };
};

export default useGetMinistry;
