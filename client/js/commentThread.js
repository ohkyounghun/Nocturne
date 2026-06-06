import { deleteComment, getComments, postComment } from "./api.js";

function getSpotIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get("id");
}

async function loadComments(spotId) {
    return getComments(spotId);
}

function getCurrentUserId() {
    const token = localStorage.getItem("token");

    if (!token) {
        return null;
    }

    try {
        const encodedPayload = token.split(".")[1]
            .replace(/-/g, "+")
            .replace(/_/g, "/");
        const paddedPayload = encodedPayload.padEnd(
            Math.ceil(encodedPayload.length / 4) * 4,
            "="
        );
        const payload = JSON.parse(atob(paddedPayload));
        return Number(payload.sub);
    } catch {
        return null;
    }
}

function renderComments({ spotId, commentList, comments, currentUserId }) {
    commentList.replaceChildren();

    comments.forEach((comment) => {
        const item = document.createElement("li");
        const author = document.createElement("strong");
        const content = document.createElement("p");
        item.className = "comment-item";

        // Render user input only as text, never as HTML.
        author.textContent = comment.username || "Anonymous";
        content.textContent = comment.content || "";

        item.append(author, content);

        if (Number(comment.user_id) === currentUserId) {
            const deleteButton = document.createElement("button");
            deleteButton.type = "button";
            deleteButton.textContent = "Delete";
            deleteButton.addEventListener("click", () => {
                void deleteComment(spotId, comment.id)
                    .then(() => refreshComments(spotId, commentList))
                    .catch(() => renderCommentError(commentList));
            });
            item.append(deleteButton);
        }

        commentList.append(item);
    });
}

function renderCommentError(commentList) {
    const item = document.createElement("li");
    item.textContent = "Comments could not be loaded.";
    commentList.replaceChildren(item);
}

async function refreshComments(spotId, commentList) {
    const comments = await loadComments(spotId);
    renderComments({
        spotId,
        commentList,
        comments,
        currentUserId: getCurrentUserId()
    });
}

async function handleCommentSubmit({ spotId, commentList, commentInput }) {
    const content = commentInput.value.trim();

    if (!content) {
        return;
    }

    await postComment(spotId, content);
    commentInput.value = "";
    await refreshComments(spotId, commentList);
}

export function initCommentThread() {
    // Entry point for initializing the comment UI.
    const spotId = getSpotIdFromUrl();
    const commentList = document.getElementById("comment-list");
    const commentInput = document.getElementById("comment-input");
    const commentButton = document.getElementById("btn-comment");

    if (!spotId || !commentList || !commentInput || !commentButton) {
        return;
    }

    void refreshComments(spotId, commentList)
        .catch(() => renderCommentError(commentList));

    commentButton.addEventListener("click", () => {
        if (!localStorage.getItem("token")) {
            window.location.href = "login.html";
            return;
        }
        void handleCommentSubmit({ spotId, commentList, commentInput })
            .catch(() => renderCommentError(commentList));
    });
}