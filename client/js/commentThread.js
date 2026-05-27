import { getComments, postComment } from "./api.js";

function getSpotIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get("id");
}

async function loadComments(spotId) {
    return getComments(spotId);
}

function renderComments(commentList, comments) {
    commentList.replaceChildren();

    comments.forEach((comment) => {
        const item = document.createElement("li");
        const author = document.createElement("strong");
        const content = document.createElement("p");

        // 사용자 입력은 HTML로 해석하지 않고 텍스트로만 렌더링한다.
        // Render user input only as text, never as HTML.
        author.textContent = comment.username || "Anonymous";
        content.textContent = comment.content || "";

        item.append(author, content);
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
    renderComments(commentList, comments);
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
    // 댓글 UI 초기화 진입점이다.
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
        void handleCommentSubmit({ spotId, commentList, commentInput })
            .catch(() => renderCommentError(commentList));
    });
}
