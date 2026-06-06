jest.mock("../server/models/comments", () => ({
    getBySpot: jest.fn(),
    create: jest.fn(),
    delete: jest.fn()
}));

const comments = require("../server/models/comments");
const commentsController = require("../server/controllers/commentsController");
const authenticate = require("../server/middleware/auth");

function createResponse() {
    return {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
        send: jest.fn().mockReturnThis()
    };
}

describe("commentsController", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("creates a comment for the authenticated user", async () => {
        const req = {
            params: { id: "3" },
            body: { content: "  Beautiful night view  " },
            user: { sub: 7 }
        };
        const res = createResponse();
        const createdComment = {
            id: 12,
            spot_id: 3,
            user_id: 7,
            content: "Beautiful night view"
        };
        comments.create.mockResolvedValue(createdComment);

        await commentsController.create(req, res);

        expect(comments.create).toHaveBeenCalledWith({
            spotId: 3,
            userId: 7,
            content: "Beautiful night view"
        });
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(createdComment);
    });

    test("deletes a comment owned by the authenticated user", async () => {
        const req = {
            params: { spotId: "3", commentId: "12" },
            user: { sub: 7 }
        };
        const res = createResponse();
        comments.delete.mockResolvedValue(1);

        await commentsController.remove(req, res);

        expect(comments.delete).toHaveBeenCalledWith({
            spotId: 3,
            commentId: 12,
            userId: 7
        });
        expect(res.status).toHaveBeenCalledWith(204);
        expect(res.send).toHaveBeenCalled();
    });

    test("rejects a comment deletion request without authentication", () => {
        const req = {
            headers: {},
            params: { spotId: "3", commentId: "12" }
        };
        const res = createResponse();
        const next = jest.fn();

        authenticate(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ code: "UNAUTHORIZED" });
        expect(next).not.toHaveBeenCalled();
        expect(comments.delete).not.toHaveBeenCalled();
    });
});
