function getSpotIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get("id");
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
}
