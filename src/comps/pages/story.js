import React, { useEffect, useState, useMemo, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Avatar,
  IconButton,
  Button,
  Container,
  Card,
  CardContent,
  CardMedia,
  TextField,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  AppBar,
  Toolbar,
  InputAdornment,
  Paper,
  Divider,
  useMediaQuery,
} from "@mui/material";
import {
  ArrowBack,
  ThumbUp,
  ThumbUpOutlined,
  ThumbDown,
  ThumbDownOutlined,
  Comment as CommentIcon,
} from "@mui/icons-material";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import firebase from "../../firebase";
import useGetUser from "../hooks/useGetUser";
import { useTheme as useCustomTheme } from "../template/themeContext";
import getTimeSincePostCreation from "../template/getTimeSincePostCreation";

function Story() {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme: appTheme } = useCustomTheme();
  // const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { data } = location.state || {};
  const [expanded, setExpanded] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [dislikesCount, setDislikesCount] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState({});
  const author = useGetUser(data?.author).docs;
  const commentInputRef = useRef(null);

  const imageData =
    data?.imagesUrls?.map((url) => ({ src: url, alt: "" })) || [];
  const createdAt = data?.createdAt
    ? getTimeSincePostCreation(data.createdAt.seconds)
    : "";

    useEffect(() => {
      const authUnsubscribe = firebase.auth().onAuthStateChanged((loggedInUser) => {
        if (loggedInUser) {
          setIsLoggedIn(true);
          const userDocRef = firebase.firestore().collection("app_users").doc(loggedInUser.uid);
          const unsubscribe = userDocRef.onSnapshot((doc) => {
            setUser(doc.data());
          });
          return () => unsubscribe();
        } else {
          setIsLoggedIn(false);
          setUser({});
        }
      });
  
      return () => authUnsubscribe();
    }, []);
  
    // console.log("user: " + user);
    useEffect(() => {
      const loadComments = async () => {
        try {
          const commentsSnapshot = await firebase
            .firestore()
            .collection("Comments")
            .orderBy("timestamp", "asc")
            .where("article_id", "==", data.id)
            .get();
          const commentsData = commentsSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          await fetchAuthorsDetails(commentsData);
        } catch (error) {
          console.error("Error loading comments:", error);
        }
      };
  
      const fetchAuthorsDetails = async (commentsData) => {
        const authorsDetails = {};
        for (const comment of commentsData) {
          if (!authorsDetails[comment.authorId]) {
            const userDoc = await firebase
              .firestore()
              .collection("Users")
              .doc(comment.authorId)
              .get();
            authorsDetails[comment.authorId] = userDoc.data();
          }
          comment.authorDetails = authorsDetails[comment.authorId];
        }
        setComments(commentsData);
      };
  
      loadComments();
    }, [data.id]);
  
    const handleComment = async (event) => {
      event.preventDefault();
      try {
        if (newComment.trim() !== "") {
          await firebase.firestore().collection("Comments").add({
            article_id: data.id,
            authorId: firebase.auth().currentUser.uid,
            content: newComment,
            author: user.name,
            authorPhoto: user.photoURL,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
          });
          setNewComment("");
          // Update comments state without fetching from Firestore again
          setComments((prevComments) => [
            ...prevComments,
            {
              id: Math.random().toString(36).substr(2, 9), // Generate temporary ID
              article_id: data.id,
              authorId: firebase.auth().currentUser.uid,
              content: newComment,
              author: user.name,
              authorPhoto: user.photoURL,
              timestamp: new Date(),
            },
          ]);
        }
      } catch (error) {
        console.error("Error adding comment:", error);
        alert("Failed to add comment. Please try again.");
      }
    };
  
    useEffect(() => {
      const checkLikeStatus = async () => {
        try {
          const likeSnapshot = await firebase
            .firestore()
            .collection("Reactions")
            .where("article_id", "==", data.id)
            .where("liked", "==", true)
            .get();
          setLikesCount(likeSnapshot.size);
  
          const dislikeSnapshot = await firebase
            .firestore()
            .collection("Reactions")
            .where("article_id", "==", data.id)
            .where("liked", "==", false)
            .get();
          setDislikesCount(dislikeSnapshot.size);
  
          // Check if the current user has already liked/disliked the article
          const currentUserLike = likeSnapshot.docs.find(
            (doc) => doc.data().user_id === firebase.auth().currentUser.uid
          );
          setLiked(!!currentUserLike);
  
          const currentUserDislike = dislikeSnapshot.docs.find(
            (doc) => doc.data().user_id === firebase.auth().currentUser.uid
          );
          setDisliked(!!currentUserDislike);
        } catch (error) {
          console.error("Error checking like/dislike status:", error);
        }
      };
  
      checkLikeStatus();
    }, [data.id]);

  // Reaction handling
  const handleLike = async () => {
    setLoading(true); // Set loading to true
    try {
      const reactionsRef = firebase.firestore().collection("Reactions");
      const reactionSnapshot = await reactionsRef
        .where("article_id", "==", data.id)
        .where("user_id", "==", firebase.auth().currentUser.uid)
        .get();

      if (!reactionSnapshot.empty) {
        const reactionDoc = reactionSnapshot.docs[0];
        const currentReaction = reactionDoc.data();

        if (currentReaction.liked) {
          // Already liked, do nothing
          return;
        } else {
          // Previously disliked, update to liked
          await reactionsRef.doc(reactionDoc.id).update({ liked: true });
          setLiked(true);
          setDisliked(false);
          setLikesCount((prev) => prev + 1);
          setDislikesCount((prev) => prev - 1);
        }
      } else {
        // No reaction yet, add new like
        await reactionsRef.add({
          article_id: data.id,
          user_id: firebase.auth().currentUser.uid,
          liked: true,
        });
        setLiked(true);
        setLikesCount((prev) => prev + 1);
      }
    } catch (error) {
      console.error("Error liking article:", error);
      alert("Failed to like article. Please try again.");
    } finally {
      setLoading(false); // Set loading to false
    }
  };

  const handleDislike = async () => {
    setLoading(true); // Set loading to true
    try {
      const reactionsRef = firebase.firestore().collection("Reactions");
      const reactionSnapshot = await reactionsRef
        .where("article_id", "==", data.id)
        .where("user_id", "==", firebase.auth().currentUser.uid)
        .get();

      if (!reactionSnapshot.empty) {
        const reactionDoc = reactionSnapshot.docs[0];
        const currentReaction = reactionDoc.data();

        if (currentReaction.liked === false) {
          // Already disliked, do nothing
          return;
        } else {
          // Previously liked, update to disliked
          await reactionsRef.doc(reactionDoc.id).update({ liked: false });
          setDisliked(true);
          setLiked(false);
          setDislikesCount((prev) => prev + 1);
          setLikesCount((prev) => prev - 1);
        }
      } else {
        // No reaction yet, add new dislike
        await reactionsRef.add({
          article_id: data.id,
          user_id: firebase.auth().currentUser.uid,
          liked: false,
        });
        setDisliked(true);
        setDislikesCount((prev) => prev + 1);
      }
    } catch (error) {
      console.error("Error disliking article:", error);
      alert("Failed to dislike article. Please try again.");
    } finally {
      setLoading(false); // Set loading to false
    }
  };

  return (
    <Box
      sx={{
        pb: 8,
        pt: { xs: 8, sm: 10 },
        backgroundColor: appTheme === "light" ? "whitesmoke" : "#2C2C2C",
        color: appTheme === "light" ? "#111111" : "white",
      }}
    >
      <AppBar
        position="fixed"
        color="default"
        elevation={1}
        style={{
          backgroundColor: appTheme === "light" ? "whitesmoke" : "#2C2C2C",
          color: appTheme === "light" ? "#111111" : "white",
        }}
      >
        <Toolbar>
          <IconButton edge="start" onClick={() => navigate(-1)}>
            <ArrowBack />
          </IconButton>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ ml: 2 }}>
            <Avatar
              src={author?.photoURL || "/assets/profile.png"}
              sx={{ width: 32, height: 32 }}
            />
            <Typography variant="subtitle1">
              {author?.firstName || "user"} {author?.lastName || ""}
            </Typography>
          </Stack>
        </Toolbar>
      </AppBar>

      <Container
        maxWidth="md"
        style={{
          backgroundColor: appTheme === "light" ? "whitesmoke" : "#2C2C2C",
          color: appTheme === "light" ? "#111111" : "white",
        }}
      >
        <Card
          elevation={0}
          style={{
            backgroundColor: appTheme === "light" ? "whitesmoke" : "#2C2C2C",
            color: appTheme === "light" ? "#111111" : "white",
          }}
        >
          <Typography variant="h4" gutterBottom sx={{ mt: 2 }}>
            {data?.title}
          </Typography>

          <Typography variant="caption">Posted {createdAt}</Typography>

          <CardMedia
            component="img"
            image={data?.imagesUrls?.[0] || "/assets/Flag_of_Zambia.png"}
            alt={data?.ministry}
            sx={{
              height: { xs: 300, sm: 400 },
              mt: 2,
              cursor: "pointer",
              borderRadius: 1,
            }}
            onClick={() => setLightboxOpen(true)}
          />

          <CardContent>
            <Typography
              variant="body1"
              sx={{ mt: 2 }}
              dangerouslySetInnerHTML={{
                __html: expanded ? data.content : data.content.slice(0, 200),
              }}
            />

            {(data?.content?.length || 0) > 200 && (
              <Button onClick={() => setExpanded(!expanded)} sx={{ mt: 1 }}>
                {expanded ? "Show less" : "Read more"}
              </Button>
            )}

            <Stack
              direction="row"
              spacing={2}
              alignItems="center"
              sx={{ mt: 2 }}
            >
              <IconButton
                onClick={() => commentInputRef.current?.focus()}
                sx={{ color: appTheme === "light" ? "#111111" : "white" }}
              >
                <CommentIcon />
              </IconButton>
              <Box sx={{ ml: "auto" }}>
                <IconButton
                  onClick={handleLike}
                  disabled={!isLoggedIn || loading}
                  sx={{ color: appTheme === "light" ? "#111111" : "white" }}
                >
                  {liked ? <ThumbUp /> : <ThumbUpOutlined />}
                </IconButton>
                <Typography
                  component="span"
                  sx={{ color: appTheme === "light" ? "#111111" : "white" }}
                >
                  {likesCount}
                </Typography>
                <IconButton
                  onClick={handleDislike}
                  disabled={!isLoggedIn || loading}
                  sx={{ color: appTheme === "light" ? "#111111" : "white" }}
                >
                  {disliked ? <ThumbDown /> : <ThumbDownOutlined />}
                </IconButton>
                <Typography
                  component="span"
                  sx={{ color: appTheme === "light" ? "#111111" : "white" }}
                >
                  {dislikesCount}
                </Typography>
              </Box>
            </Stack>

            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" gutterBottom>
              Comments
            </Typography>

            {comments.map((comment, index) => (
              <Paper
                key={index}
                elevation={0}
                sx={{
                  p: 2,
                  mb: 2,
                  bgcolor: "action.hover",
                }}
                style={{
                  backgroundColor:
                    appTheme === "light" ? "whitesmoke" : "#2C2C2C",
                  color: appTheme === "light" ? "#111111" : "white",
                }}
              >
                <Stack direction="row" spacing={2}>
                  <Avatar
                    src={
                      comment.authorPhoto || "/assets/profile.png"
                    }
                    sx={{ width: 40, height: 40 }}
                  />
                  <Box>
                    <Typography variant="subtitle2">
                      {comment.author || "Anonymous"}
                    </Typography>
                    <Typography variant="body2">{comment.content}</Typography>
                  </Box>
                </Stack>
              </Paper>
            ))}
          </CardContent>
        </Card>

        {isLoggedIn && (
          <Paper
            elevation={3}
            sx={{
              position: "fixed",
              bottom: 0,
              left: 0,
              right: 0,
              p: 2,
              backgroundColor: appTheme === "light" ? "whitesmoke" : "#2C2C2C",
              color: appTheme === "light" ? "#111111" : "white",
            }}
          >
            <form onSubmit={handleComment}>
              <TextField
                fullWidth
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                inputRef={commentInputRef}
                InputProps={{
                  sx: {
                    color: appTheme === "light" ? "#111111" : "white", // Text color
                  },
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton type="submit">
                        <CommentIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </form>
          </Paper>
        )}

        <Lightbox
          open={lightboxOpen}
          close={() => setLightboxOpen(false)}
          slides={imageData}
        />
      </Container>
    </Box>
  );
}

export default Story;
