import { Type, type Static } from "typebox"
export function BenchmarkSchema(conf: {format: "unsafe" | "safe"}) {
  return Type.Array(Type.Object({
    id: Type.String(conf),
    username: Type.String(conf),
    email: Type.String(conf),
    active: Type.Boolean(),

    profile: Type.Object({
      firstName: Type.String(conf),
      lastName: Type.String(conf),
      age: Type.Number(),

      address: Type.Object({
        street: Type.String(conf),
        city: Type.String(conf),
        state: Type.String(conf),
        country: Type.String(conf),
        zip: Type.String(conf),

        location: Type.Object({
          lat: Type.Number(),
          lng: Type.Number(),
        }),
      }),

      phones: Type.Array(
        Type.Object({
          type: Type.String(conf),
          number: Type.String(conf),
          verified: Type.Boolean(),
        })
      ),

      socials: Type.Array(
        Type.Object({
          platform: Type.String(conf),
          url: Type.String(conf),
          followers: Type.Number(),
        })
      ),
    }),

    preferences: Type.Object({
      theme: Type.String(conf),
      language: Type.String(conf),

      notifications: Type.Object({
        email: Type.Boolean(),
        sms: Type.Boolean(),
        push: Type.Boolean(),
      }),

      dashboard: Type.Object({
        widgets: Type.Array(
          Type.Object({
            id: Type.String(conf),
            type: Type.String(conf),
            enabled: Type.Boolean(),
            order: Type.Number(),

            settings: Type.Object({
              refresh: Type.Number(),
              pageSize: Type.Number(),
              columns: Type.Number(),
              compact: Type.Boolean(),
            }),
          })
        ),
      }),
    }),

    roles: Type.Array(Type.String(conf)),

    permissions: Type.Array(
      Type.Object({
        resource: Type.String(conf),
        create: Type.Boolean(),
        read: Type.Boolean(),
        update: Type.Boolean(),
        delete: Type.Boolean(),
      })
    ),

    organizations: Type.Array(
      Type.Object({
        id: Type.String(conf),
        name: Type.String(conf),

        teams: Type.Array(
          Type.Object({
            id: Type.String(conf),
            name: Type.String(conf),

            projects: Type.Array(
              Type.Object({
                id: Type.String(conf),
                name: Type.String(conf),
                archived: Type.Boolean(),

                repositories: Type.Array(
                  Type.Object({
                    name: Type.String(conf),
                    private: Type.Boolean(),

                    branches: Type.Array(
                      Type.Object({
                        name: Type.String(conf),
                        commits: Type.Number(),
                        protected: Type.Boolean(),
                      })
                    ),
                  })
                ),
              })
            ),
          })
        ),
      })
    ),

    sessions: Type.Array(
      Type.Object({
        id: Type.String(conf),
        createdAt: Type.String(conf),
        expiresAt: Type.String(conf),
        ip: Type.String(conf),
        userAgent: Type.String(conf),

        device: Type.Object({
          os: Type.String(conf),
          browser: Type.String(conf),
          mobile: Type.Boolean(),
        }),
      })
    ),

    metrics: Type.Object({
      loginCount: Type.Number(),
      purchaseCount: Type.Number(),
      reputation: Type.Number(),

      balances: Type.Object({
        usd: Type.Number(),
        eur: Type.Number(),
        btc: Type.Number(),
      }),

      monthly: Type.Array(
        Type.Object({
          month: Type.String(conf),
          visits: Type.Number(),
          purchases: Type.Number(),
          revenue: Type.Number(),
        })
      ),
    }),

    tags: Type.Array(Type.String(conf)),
  }));
}
export const benchmarkValue: Static<ReturnType<typeof BenchmarkSchema>>[0] = {
  id: "u123456",
  username: "jdoe",
  email: "john@example.com",
  active: true,

  profile: {
    firstName: "John",
    lastName: "Doe",
    age: 32,

    address: {
      street: "123 Main St",
      city: "New York",
      state: "NY",
      country: "USA",
      zip: "10001",

      location: {
        lat: 40.7128,
        lng: -74.006,
      },
    },

    phones: [
      {
        type: "mobile",
        number: "+1 555 1111",
        verified: true,
      },
      {
        type: "work",
        number: "+1 555 2222",
        verified: false,
      },
    ],

    socials: [
      {
        platform: "github",
        url: "https://github.com/jdoe",
        followers: 500,
      },
      {
        platform: "twitter",
        url: "https://twitter.com/jdoe",
        followers: 1200,
      },
    ],
  },

  preferences: {
    theme: "dark",
    language: "en",

    notifications: {
      email: true,
      sms: false,
      push: true,
    },

    dashboard: {
      widgets: [
        {
          id: "w1",
          type: "chart",
          enabled: true,
          order: 1,
          settings: {
            refresh: 30,
            pageSize: 25,
            columns: 3,
            compact: false,
          },
        },
        {
          id: "w2",
          type: "table",
          enabled: true,
          order: 2,
          settings: {
            refresh: 60,
            pageSize: 50,
            columns: 5,
            compact: true,
          },
        },
      ],
    },
  },

  roles: ["admin", "editor"],

  permissions: [
    {
      resource: "users",
      create: true,
      read: true,
      update: true,
      delete: false,
    },
    {
      resource: "billing",
      create: false,
      read: true,
      update: false,
      delete: false,
    },
  ],

  organizations: [
    {
      id: "org1",
      name: "Acme",

      teams: [
        {
          id: "team1",
          name: "Platform",

          projects: [
            {
              id: "project1",
              name: "Backend",
              archived: false,

              repositories: [
                {
                  name: "api",
                  private: true,

                  branches: [
                    {
                      name: "main",
                      commits: 1450,
                      protected: true,
                    },
                    {
                      name: "develop",
                      commits: 850,
                      protected: false,
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ],

  sessions: [
    {
      id: "session1",
      createdAt: "2025-01-01T00:00:00Z",
      expiresAt: "2025-01-08T00:00:00Z",
      ip: "127.0.0.1",
      userAgent: "Chrome",

      device: {
        os: "macOS",
        browser: "Chrome",
        mobile: false,
      },
    },
  ],

  metrics: {
    loginCount: 512,
    purchaseCount: 38,
    reputation: 98.4,

    balances: {
      usd: 1234.56,
      eur: 456.78,
      btc: 0.01234,
    },

    monthly: [
      {
        month: "2025-01",
        visits: 450,
        purchases: 8,
        revenue: 1250.5,
      },
      {
        month: "2025-02",
        visits: 520,
        purchases: 12,
        revenue: 2100.75,
      },
    ],
  },

  tags: [
    "enterprise",
    "beta",
    "premium",
    "analytics",
  ],
};

