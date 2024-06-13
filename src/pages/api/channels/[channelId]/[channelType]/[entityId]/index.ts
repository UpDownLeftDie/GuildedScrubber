import { ChannelEndpoint } from "@/classes/Channel";
import { ChannelService, MessageService } from "@/services";
import HTTPMethod from "http-method-enum";
import { NextApiRequest, NextApiResponse } from "next";

async function handlePUT(
  req: NextApiRequest,
  res: NextApiResponse,
  channelType: ChannelEndpoint,
  channelId: string,
  entityId: string,
  body: string,
) {
  const updatedMessage = await MessageService.UpdateMessage(
    req,
    channelId,
    channelType,
    entityId,
    body,
  );
  return res.json(updatedMessage);
}

async function handleDELETE(
  req: NextApiRequest,
  res: NextApiResponse,
  channelType: ChannelEndpoint,
  channelId: string,
  entityId: string,
) {
  const deletedEntity = await ChannelService.DeleteChannelEntity(
    req,
    channelId,
    channelType,
    entityId,
  );
  return res.json(deletedEntity);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const channelId = req.query.channelId as string;
  const entityId = req.query.messageId as string;
  const channelType = req.query.channelType as ChannelEndpoint;

  switch (req.method) {
    case HTTPMethod.PUT:
      const body = req.body as string;
      return handlePUT(req, res, channelType, channelId, entityId, body);
    case HTTPMethod.DELETE:
      return handleDELETE(req, res, channelType, channelId, entityId);
    default:
      res.status(404);
  }
}
