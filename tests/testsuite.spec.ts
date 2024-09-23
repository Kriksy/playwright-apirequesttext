import { test, expect, request } from "@playwright/test";
import { faker } from "@faker-js/faker";

test.describe("Test suite backend v1", () => {
  test("Test case 01 - Get all posts", async ({ request }) => {
    const getPostsResponse = await request.get("http://localhost:3000/posts");
    expect(getPostsResponse.ok()).toBeTruthy();
    expect(getPostsResponse.status).toBe(200);
  });
  test("Test case 02 - Create Post", async ({ request }) => {
    const payload = {
      title: faker.lorem.sentence(),
      views: faker.number.int({ min: 10, max: 100 }),
    };

    const createPostsResponse = await request.post(
      "http://localhost:3000/posts",
      {
        data: JSON.stringify(payload),
        // data: {
        //   title: "Omnis ex accedo. Comitatus ducimus comedo.",
        //   views: 50,
        // },
      }
    );
    expect(createPostsResponse.ok()).toBeTruthy();
    expect(createPostsResponse.status).toBe(201);

    // verify that the response of the post method contains the new record.
    expect(createPostsResponse.json()).toMatchObject(
      expect.objectContaining({
        title: payload.title,
        views: payload.views,
      })
    );

    // verify that when you get all the posts, the new record is in there.
    const getPostsResponse = await request.get("http://localhost:3000/posts");
    expect(getPostsResponse.ok()).toBeTruthy();

    const allPost = await getPostsResponse.json();
    expect(allPost).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          title: payload.title,
          views: payload.views,
        }),
      ])
    );
  });
  test("Test case 03 - Delete Post by ID", async ({ request }) => {
    // Get all posts in order to access its elements.
    const getPostsResponse = await request.get("http://localhost:3000/posts");
    expect(getPostsResponse.ok()).toBeTruthy(); // Assertion

    const allPosts = await getPostsResponse.json();
    expect(allPosts.length).toBeGreaterThan(3); // van nekünk legalább 3 postunk?

    // retrieve the id of the last element in the array
    // Ta int sista från listan, för kan bli fel med tester
    const lastButOnePostID = allPosts[allPosts.length - 2];

    // DELETE request
    const deletePostResponse = await request.delete(
      `http://localhost:3000/posts/${lastButOnePostID}`
    );
    expect(deletePostResponse.ok()).toBeTruthy(); // Assertion
    // expect(getPostsResponse.status).toBe(200);

    // Verify that the element is gone
    const deletedElementResponse = await request.get(
      `http://localhost:3000/posts/${lastButOnePostID}`
    );
    expect(deletedElementResponse.status).toBe(404);
  });
});
