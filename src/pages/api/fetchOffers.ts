import { getOffersQuery, GetOffersQueryResponse } from "@/utils/queries";
import CONSTANTS from "@/utils/constants";
import { GraphQLClient } from "graphql-request";
import { NextApiRequest, NextApiResponse } from "next";

const client = new GraphQLClient(
  CONSTANTS.RISKOPHOBE_SUBGRAPH_ENDPOINT,
  {
    headers: {
      Authorization: `Bearer ${process.env.GRAPHQL_API_KEY}`,
    },
  }
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const data: GetOffersQueryResponse = await client.request(getOffersQuery);
  try {
    res.status(200).json(data);
  } catch (error) {
    console.error("getOffers ERROR =>", error);
    res.status(500).json({ error: "Failed to fetch data" });
  }
}
