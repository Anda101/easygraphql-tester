"use strict";

const fs = require("fs");
const path = require("path");
const { expect } = require("chai");
const EasyGraphQLTester = require("easygraphql-tester");

const schemaCode = fs.readFileSync(
  path.join(__dirname, "..", "schema.gql"),
  "utf8"
);

describe("Mock queries and mutations", () => {
  let tester;
  beforeAll(() => {
    tester = new EasyGraphQLTester(schemaCode);
  });

  afterAll(() => {
    tester.clearFixture();
  });

  test("Should mock the errors", () => {
    const query = `
      query trialQuery($repo: String!, $count: Int, $orderBy: IssueOrder) {
        viewer {
          name
          isHireable
          repository(name: $repo) {
            issues(first: $count, orderBy: $orderBy) {
              pageInfo {
                hasPreviousPage
                hasNextPage
                startCursor
                endCursor
              }
              totalCount
              edges {
                node {
                  id
                  title
                  viewerDidAuthor
                  state
                }
              }
            }
          }
        }
        licenses {
          id
          name
          invalid
        }
      }
    `;

    const variables = {
      repo: "test",
      count: 5,
      orderBy: { field: "CREATED_AT", direction: "DESC" }
    };

    const { data, errors } = tester.mock({
      query,
      variables,
      mockErrors: true
    });

    const { edges } = data.viewer.repository.issues;
    expect(edges).to.be.an("array");
    expect(edges.length).to.be.gt(0);
    expect(edges[0].node.id).to.be.a("string");

    expect(data).to.exist;
    expect(errors).to.exist;
    expect(errors).to.be.an("array");
    expect(errors[0].message).to.be.eq(
      'Cannot query field "invalid" on type "License".'
    );
  });

  test("Should set fixture before the mock and set errors fixture", () => {
    const fixture = {
      data: {
        viewer: {
          name: "martin",
          isHireable: false,
          repository: {
            issues: {
              pageInfo: {
                hasPreviousPage: false,
                hasNextPage: true,
                startCursor:
                  "Y3Vyc29yOnYyOpK5MjAxOS0wMS0xNFQxMDowNTo0NSswMTowMM4XxS65",
                endCursor:
                  "Y3Vyc29yOnYyOpK5MjAxOS0wMS0xNFQxMDowNDo0MyswMTowMM4XxS1p"
              },
              totalCount: 25,
              edges: [
                {
                  node: {
                    id: "MDU6SXNzdWUzOTg3OTg1MjE=",
                    title: "test 25",
                    viewerDidAuthor: true,
                    state: "OPEN"
                  }
                },
                {
                  node: {
                    id: "MDU6SXNzdWUzOTg3OTg0ODk=",
                    title: "test 24",
                    viewerDidAuthor: true,
                    state: "OPEN"
                  }
                },
                {
                  node: {
                    id: "MDU6SXNzdWUzOTg3OTg0NTM=",
                    title: "test 23",
                    viewerDidAuthor: true,
                    state: "OPEN"
                  }
                },
                {
                  node: {
                    id: "MDU6SXNzdWUzOTg3OTg0MjA=",
                    title: "test 22",
                    viewerDidAuthor: true,
                    state: "OPEN"
                  }
                },
                {
                  node: {
                    id: "MDU6SXNzdWUzOTg3OTgzODc=",
                    title: "test 21",
                    viewerDidAuthor: true,
                    state: "OPEN"
                  }
                }
              ]
            }
          }
        },
        licenses: [
          {
            id: "MDc6TGljZW5zZTg=",
            name: "GNU General Public License v2.0"
          },
          null,
          {
            id: "MDc6TGljZW5zZTU=",
            name: 'BSD 3-Clause "New" or "Revised" License'
          }
        ]
      },
      errors: [
        {
          message: "License with ID 2 could not be fetched.",
          locations: [{ line: 3, column: 7 }],
          path: ["licenses", 1, "name"]
        }
      ]
    };

    tester.setFixture(fixture);
    const query = `
      query trialQuery($repo: String!, $count: Int, $orderBy: IssueOrder) {
        viewer {
          name
          isHireable
          repository(name: $repo) {
            issues(first: $count, orderBy: $orderBy) {
              pageInfo {
                hasPreviousPage
                hasNextPage
                startCursor
                endCursor
              }
              totalCount
              edges {
                node {
                  id
                  title
                  viewerDidAuthor
                  state
                }
              }
            }
          }
        }
        licenses {
          id
          name
        }
      }
    `;

    const variables = {
      repo: "test",
      count: 5,
      orderBy: { field: "CREATED_AT", direction: "DESC" }
    };

    const { data, errors } = tester.mock({
      query,
      fixture,
      variables,
      mockErrors: true
    });

    const { edges } = data.viewer.repository.issues;
    expect(edges).to.be.an("array");
    expect(edges).to.have.length(5);

    expect(edges[0].node.title).to.be.eq("test 25");
    expect(edges[1].node.title).to.be.eq("test 24");
    expect(edges[2].node.title).to.be.eq("test 23");
    expect(edges[3].node.title).to.be.eq("test 22");
    expect(edges[4].node.title).to.be.eq("test 21");

    expect(data).to.exist;
    expect(errors).to.exist;
    expect(errors).to.be.an("array");
    expect(errors[0].message).to.be.eq(
      "License with ID 2 could not be fetched."
    );
  });
});
