export interface JetstreamEvent {
    did: string,
    timeUs: Number,
    kind: "commit",
    commit: Commit
};

// example entry
export type Commit = {
      rev: string,
      operation: "create",
      collection: string,
      rkey: string,
      record: {
        type: string,
        createdAt: Date,
        embed: {
          type: "app.bsky.embed.images",
          "images": Array<
            {
              alt: string,
              aspectRatio: {
                height: Number,
                width: Number
              },
              image: {
                type: "blob" | string,
                ref: {
                  link: string
                },
                mimeType: "image/jpeg" | string,
                size: Number
              }
            }>
        },
        facets: [], 
        //         [
        //   {
        //     "features": [
        //       {
        //         "$type": "app.bsky.richtext.facet#tag",
        //         "tag": "crypto"
        //       }
        //     ],
        //     "index": {
        //       "byteEnd": 83,
        //       "byteStart": 76
        //     }
        //   },
        //   {
        //     "features": [
        //       {
        //         "$type": "app.bsky.richtext.facet#tag",
        //         "tag": "BTC"
        //       }
        //     ],
        //     "index": {
        //       "byteEnd": 107,
        //       "byteStart": 103
        //     }
        //   },
        //   {
        //     "features": [
        //       {
        //         "$type": "app.bsky.richtext.facet#tag",
        //         "tag": "ETH"
        //       }
        //     ],
        //     "index": {
        //       "byteEnd": 125,
        //       "byteStart": 121
        //     }
        //   },
        //   {
        //     "features": [
        //       {
        //         "$type": "app.bsky.richtext.facet#tag",
        //         "tag": "XRP"
        //       }
        //     ],
        //     "index": {
        //       "byteEnd": 157,
        //       "byteStart": 153
        //     }
        //   },
        //   {
        //     "features": [
        //       {
        //         "$type": "app.bsky.richtext.facet#tag",
        //         "tag": "Altcoins"
        //       }
        //     ],
        //     "index": {
        //       "byteEnd": 197,
        //       "byteStart": 188
        //     }
        //   },
        //   {
        //     "features": [
        //       {
        //         "$type": "app.bsky.richtext.facet#tag",
        //         "tag": "ADA"
        //       }
        //     ],
        //     "index": {
        //       "byteEnd": 207,
        //       "byteStart": 203
        //     }
        //   },
        //   {
        //     "features": [
        //       {
        //         "$type": "app.bsky.richtext.facet#tag",
        //         "tag": "SOL"
        //       }
        //     ],
        //     "index": {
        //       "byteEnd": 231,
        //       "byteStart": 227
        //     }
        //   },
        //   {
        //     "features": [
        //       {
        //         "$type": "app.bsky.richtext.facet#tag",
        //         "tag": "CryptoMarketToday"
        //       }
        //     ],
        //     "index": {
        //       "byteEnd": 278,
        //       "byteStart": 260
        //     }
        //   },
        //   {
        //     "features": [
        //       {
        //         "$type": "app.bsky.richtext.facet#tag",
        //         "tag": "Bitcoin"
        //       }
        //     ],
        //     "index": {
        //       "byteEnd": 287,
        //       "byteStart": 279
        //     }
        //   },
        //   {
        //     "features": [
        //       {
        //         "$type": "app.bsky.richtext.facet#tag",
        //         "tag": "Ethereum"
        //       }
        //     ],
        //     "index": {
        //       "byteEnd": 297,
        //       "byteStart": 288
        //     }
        //   },
        //   {
        //     "features": [
        //       {
        //         "$type": "app.bsky.richtext.facet#tag",
        //         "tag": "Solana"
        //       }
        //     ],
        //     "index": {
        //       "byteEnd": 305,
        //       "byteStart": 298
        //     }
        //   }
        // ],
        // "langs": [
        //   "en"
        // ],
        text: string,
    },
    cid: string
};