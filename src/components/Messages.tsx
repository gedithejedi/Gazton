import { Image, Typography, Space, Button } from 'antd';
import { useMessages, useW3iAccount } from "@web3inbox/widget-react";
import React from "react";
import { toast } from 'react-hot-toast';
import Card from './Card';
import { Card as ChatCard } from "antd";
import { AiOutlineClose } from 'react-icons/ai';
import SectionTitle from './SectionTitle';

function Messages() {
  const { account } = useW3iAccount();
  const { messages, deleteMessage } = useMessages(account);

  return (
    <Card>
      <SectionTitle className="mb-2">Last Messages</SectionTitle>
      <div className="overflow-y-auto max-h-[250px]">
        <div className="flex flex-col pb-4 space-y-4 relative">
          {!messages?.length ? (
            <p>No messages yet.</p>
          ) : (
            messages
              .sort((a, b) => b.id - a.id)
              .map(({ id, message }) => (
                <ChatCard
                  key={id}
                  className={` rounded-xl bg-green-50 border-1 border`}
                // onClick={async (e) => {
                //   if (e.target.closest('.delete-btn')) return;
                //   window.open(message.url, "_blank");
                // }}
                >
                  <div className='flex justify-between gap-5 mr-4 max-w-[250px]'>
                    <div className="flex flex-col">
                      <h3 className='font-bold' >{message.title}</h3>
                      <p className='break-all	'>{message.body}</p>
                    </div>
                    <div className='flex items-center w-14'>
                      <Image
                        preview={false}
                        src={message.icon}
                        alt="notification image"
                        height={56}
                        width={56}
                        className="rounded-full self-center"
                      />
                    </div>
                    <Button
                      className="delete-btn p-base absolute top-1 right-1"
                      type='text'
                      icon={<AiOutlineClose />}
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteMessage(id);
                        toast.success("Message deleted");
                      }}
                    />
                  </div>
                </ChatCard>
              ))
          )}
        </div>
      </div>
    </Card>
  );
}

export default Messages;
