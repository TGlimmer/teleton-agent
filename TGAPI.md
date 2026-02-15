# GramJS — Complete Telegram API Reference for Userbots

> Package: `telegram` (gram.js) — MTProto Layer 222+
> Sources: [gram.js.org](https://gram.js.org/) | [GitHub](https://github.com/gram-js/gramjs) | [core.telegram.org/methods](https://core.telegram.org/methods)

---

## Table of Contents

1. [TelegramClient High-Level Methods](#1-telegramclient-high-level-methods)
2. [MTProto API Methods (via client.invoke())](#2-mtproto-api-methods-via-clientinvoke)
3. [Event Builders](#3-event-builders)
4. [CustomMessage Properties & Methods](#4-custommessage-properties--methods)
5. [Dialog Properties & Methods](#5-dialog-properties--methods)
6. [Button Types](#6-button-types)
7. [Utility Functions](#7-utility-functions)

---

## 1. TelegramClient High-Level Methods

### Authentication (10)

```typescript
client.start(authParams: UserAuthParams | BotAuthParams): Promise<void>
client.checkAuthorization(): Promise<boolean>
client.isUserAuthorized(): Promise<boolean>
client.isBot(): Promise<boolean | undefined>
client.getMe(inputPeer?: false): Promise<Api.User>
client.getMe(inputPeer: true): Promise<Api.InputPeerUser>
client.signInUser(apiCredentials, authParams): Promise<Api.TypeUser>
client.signInUserWithQrCode(apiCredentials, authParams): Promise<Api.TypeUser>
client.sendCode(apiCredentials, phoneNumber, forceSMS?): Promise<{phoneCodeHash, isCodeViaApp}>
client.signInWithPassword(apiCredentials, authParams): Promise<Api.TypeUser>
client.signInBot(apiCredentials, authParams): Promise<Api.TypeUser>
client.updateTwoFaSettings(params: TwoFaParams): Promise<void>
```

### Messages (9)

```typescript
client.sendMessage(entity, params?: SendMessageParams): Promise<Api.Message>
client.editMessage(entity, params: EditMessageParams): Promise<Api.Message>
client.forwardMessages(entity, params: ForwardMessagesParams): Promise<Api.Message[]>
client.deleteMessages(entity, messageIds, {revoke?}): Promise<Api.messages.AffectedMessages[]>
client.pinMessage(entity, message?, params?): Promise<Api.Message | Api.messages.AffectedHistory>
client.unpinMessage(entity, message?, params?): Promise<Api.Message | Api.messages.AffectedHistory | undefined>
client.markAsRead(entity, message?, params?): Promise<boolean>
client.getMessages(entity?, params?): Promise<TotalList<Api.Message>>
client.iterMessages(entity?, params?): _MessagesIter | _IDsIter
```

### Upload (2)

```typescript
client.uploadFile(params: UploadFileParams): Promise<Api.InputFile | Api.InputFileBig>
client.sendFile(entity, params: SendFileInterface): Promise<Api.Message>
```

### Download (4)

```typescript
client.downloadFile(inputLocation, params?): Promise<Buffer | string | undefined>
client.iterDownload(params: IterDownloadFunction): DirectDownloadIter
client.downloadMedia(messageOrMedia, params?): Promise<Buffer | string | undefined>
client.downloadProfilePhoto(entity, params?): Promise<Buffer | string | undefined>
```

### Dialogs (2)

```typescript
client.getDialogs(params?: IterDialogsParams): Promise<TotalList<Dialog>>
client.iterDialogs(params?: IterDialogsParams): _DialogsIter
```

### Participants (3)

```typescript
client.getParticipants(entity, params?): Promise<TotalList<Api.User>>
client.iterParticipants(entity, params?): _ParticipantsIter
client.kickParticipant(entity, participant): Promise<void>
```

### Entity Resolution (4)

```typescript
client.getEntity(entity: EntityLike): Promise<Entity>
client.getEntity(entity: EntityLike[]): Promise<Entity[]>
client.getInputEntity(entity: EntityLike): Promise<Api.TypeInputPeer>
client.getPeerId(peer: EntityLike, addMark?: boolean): Promise<string>
```

### Inline / Bots (1)

```typescript
client.inlineQuery(bot, query, entity?, offset?, geoPoint?): Promise<InlineResults>
```

### Formatting & Markup (2)

```typescript
client.setParseMode(mode: "md" | "md2" | "markdown" | "markdownv2" | "html" | ParseInterface | undefined): void
client.buildReplyMarkup(buttons, inlineOnly?): Api.TypeReplyMarkup | undefined
```

### Event Handling (4)

```typescript
client.addEventHandler(callback, event?: EventBuilder): void
client.removeEventHandler(callback, event: EventBuilder): void
client.listEventHandlers(): [EventBuilder, CallableFunction][]
client.on(event?: EventBuilder): (f: (event: any) => void) => (event: any) => void
```

### Connection (5)

```typescript
client.connect(): Promise<boolean>
client.disconnect(): Promise<void>
client.destroy(): Promise<void>
client.getDC(dcId, downloadDC?, web?): Promise<{id, ipAddress, port}>
client.setLogLevel(level: LogLevel): void
```

### Direct Invoke (2)

```typescript
client.invoke<R extends Api.AnyRequest>(request: R, dcId?): Promise<R["__response"]>
client.invokeWithSender<R extends Api.AnyRequest>(request: R, sender?): Promise<R["__response"]>
```

### Properties

```typescript
client.connected: boolean | undefined
client.parseMode: ParseInterface | undefined
client.logger: Logger
client.floodSleepThreshold: number   // setter
client.maxConcurrentDownloads: number // setter
client.onError: (error: Error) => Promise<void> // setter
```

---

## 2. MTProto API Methods (via `client.invoke()`)

Usage: `await client.invoke(new Api.namespace.Method({ ...params }))`

### auth (22)

| Method | Description |
|--------|-------------|
| `auth.sendCode` | Send verification code |
| `auth.signIn` | Sign in with code |
| `auth.signUp` | Register new account |
| `auth.logOut` | Log out |
| `auth.resendCode` | Resend code via another medium |
| `auth.cancelCode` | Cancel code sending |
| `auth.checkPassword` | Verify 2FA password |
| `auth.requestPasswordRecovery` | Request password recovery |
| `auth.recoverPassword` | Recover password |
| `auth.checkRecoveryPassword` | Check recovery code |
| `auth.exportAuthorization` | Export auth for another DC |
| `auth.importAuthorization` | Import auth from another DC |
| `auth.exportLoginToken` | QR code login token |
| `auth.importLoginToken` | Import QR login token |
| `auth.acceptLoginToken` | Accept QR login |
| `auth.bindTempAuthKey` | Bind temporary auth key |
| `auth.importBotAuthorization` | Bot login |
| `auth.dropTempAuthKeys` | Drop temporary keys |
| `auth.resetAuthorizations` | Reset all sessions |
| `auth.requestFirebaseSms` | SMS via Firebase |
| `auth.importWebTokenAuthorization` | Auth via web token |
| `auth.reportMissingCode` | Report missing code |

### account (~75)

| Method | Description |
|--------|-------------|
| `account.updateProfile` | Update name/bio |
| `account.updateStatus` | Update online status |
| `account.updateBirthday` | Update birthday |
| `account.updatePersonalChannel` | Personal channel |
| `account.updateColor` | Update profile color |
| `account.getPassword` | Get 2FA info |
| `account.getPasswordSettings` | 2FA settings |
| `account.updatePasswordSettings` | Update 2FA |
| `account.resetPassword` | Reset password |
| `account.declinePasswordReset` | Decline password reset |
| `account.confirmPasswordEmail` | Confirm 2FA email |
| `account.resendPasswordEmail` | Resend 2FA email |
| `account.cancelPasswordEmail` | Cancel 2FA email |
| `account.getAuthorizations` | List active sessions |
| `account.changeAuthorizationSettings` | Change session settings |
| `account.setAuthorizationTTL` | Session TTL |
| `account.invalidateSignInCodes` | Invalidate codes |
| `account.reportPeer` | Report a peer |
| `account.reportProfilePhoto` | Report profile photo |
| `account.sendVerifyEmailCode` | Email verification code |
| `account.verifyEmail` | Verify email |
| `account.resetLoginEmail` | Reset login email |
| `account.sendVerifyPhoneCode` | Phone verification code |
| `account.verifyPhone` | Verify phone |
| `account.reorderUsernames` | Reorder usernames |
| `account.toggleUsername` | Toggle username |
| `account.toggleSponsoredMessages` | Toggle sponsored messages |
| `account.updateEmojiStatus` | Update emoji status |
| `account.getDefaultEmojiStatuses` | Default emoji statuses |
| `account.getCollectibleEmojiStatuses` | Collectible statuses |
| `account.getChannelDefaultEmojiStatuses` | Channel default statuses |
| `account.getChannelRestrictedStatusEmojis` | Restricted status emojis |
| `account.getRecentEmojiStatuses` | Recent emoji statuses |
| `account.clearRecentEmojiStatuses` | Clear recent statuses |
| `account.getReactionsNotifySettings` | Reaction notification settings |
| `account.setReactionsNotifySettings` | Set reaction notifications |
| `account.getDefaultProfilePhotoEmojis` | Profile photo emojis |
| `account.getDefaultGroupPhotoEmojis` | Group photo emojis |
| `account.getDefaultBackgroundEmojis` | Background emojis |
| `account.updateTheme` | Update theme |
| `account.uploadTheme` | Upload theme |
| `account.getThemes` | List themes |
| `account.createTheme` | Create theme |
| `account.installTheme` | Install theme |
| `account.saveTheme` | Save theme |
| `account.getTheme` | Get a theme |
| `account.getChatThemes` | Chat themes |
| `account.getUniqueGiftChatThemes` | Gift chat themes |
| `account.getWallPapers` | Wallpapers |
| `account.getWallPaper` | Single wallpaper |
| `account.getMultiWallPapers` | Multiple wallpapers |
| `account.installWallPaper` | Install wallpaper |
| `account.resetWallPapers` | Reset wallpapers |
| `account.getWebAuthorizations` | Web sessions |
| `account.resetWebAuthorization` | Reset 1 web session |
| `account.resetWebAuthorizations` | Reset all web sessions |
| `account.getAuthorizationForm` | Passport form |
| `account.acceptAuthorization` | Accept Passport |
| `account.getAllSecureValues` | All Passport values |
| `account.getSecureValue` | Single Passport value |
| `account.saveSecureValue` | Save Passport value |
| `account.deleteSecureValue` | Delete Passport value |
| `account.createBusinessChatLink` | Create business link |
| `account.editBusinessChatLink` | Edit business link |
| `account.deleteBusinessChatLink` | Delete business link |
| `account.getBusinessChatLinks` | List business links |
| `account.resolveBusinessChatLink` | Resolve business link |
| `account.updateConnectedBot` | Update connected bot |
| `account.getConnectedBots` | List connected bots |
| `account.toggleConnectedBotPaused` | Pause connected bot |
| `account.disablePeerConnectedBot` | Disable connected bot |
| `account.getBotBusinessConnection` | Bot business connection |
| `account.updateBusinessGreetingMessage` | Greeting message |
| `account.updateBusinessAwayMessage` | Away message |
| `account.updateBusinessWorkHours` | Work hours |
| `account.getPaidMessagesRevenue` | Paid messages revenue |
| `account.toggleNoPaidMessagesException` | Paid messages exception |
| `account.setMainProfileTab` | Main profile tab |
| `account.saveMusic` | Save music |
| `account.getSavedMusicIds` | Saved music IDs |

### messages (~130)

#### Core Messaging

| Method | Description |
|--------|-------------|
| `messages.sendMessage` | Send a message |
| `messages.sendMedia` | Send media |
| `messages.getMessages` | Get messages by ID |
| `messages.getHistory` | Chat history |
| `messages.search` | Search messages |
| `messages.forwardMessages` | Forward messages |
| `messages.editMessage` | Edit a message |
| `messages.deleteMessages` | Delete messages |
| `messages.getUnreadMentions` | Unread mentions |
| `messages.readHistory` | Mark as read |
| `messages.readMessageContents` | Mark content read |
| `messages.receivedMessages` | Confirm receipt |
| `messages.sendWebViewData` | Send WebView data |

#### Reports & Spam

| Method | Description |
|--------|-------------|
| `messages.report` | Report content |
| `messages.reportSpam` | Report spam |
| `messages.reportEncryptedSpam` | Report E2E spam |
| `messages.reportReaction` | Report reaction |
| `messages.reportSponsoredMessage` | Report ad |
| `messages.reportMessagesDelivery` | Report delivery |

#### Invitations & Join Requests

| Method | Description |
|--------|-------------|
| `messages.exportChatInvite` | Create invite link |
| `messages.getExportedChatInvite` | Get invite link |
| `messages.getExportedChatInvites` | List invite links |
| `messages.editExportedChatInvite` | Edit invite link |
| `messages.deleteExportedChatInvite` | Delete invite link |
| `messages.deleteRevokedExportedChatInvites` | Delete revoked links |
| `messages.getAdminsWithInvites` | Admins with invites |
| `messages.getChatInviteImporters` | Invite users |
| `messages.checkChatInvite` | Check invite link |
| `messages.importChatInvite` | Join via invite |
| `messages.hideChatJoinRequest` | Accept/reject join request |
| `messages.hideAllChatJoinRequests` | Handle all join requests |

#### Chat Management

| Method | Description |
|--------|-------------|
| `messages.createChat` | Create a group |
| `messages.addChatUser` | Add member |
| `messages.deleteChatUser` | Remove member |
| `messages.editChatAdmin` | Edit admin |
| `messages.editChatTitle` | Edit title |
| `messages.editChatPhoto` | Edit photo |
| `messages.editChatAbout` | Edit description |
| `messages.editChatDefaultBannedRights` | Default permissions |
| `messages.getChats` | Get chats |
| `messages.getFullChat` | Full chat info |
| `messages.getCommonChats` | Common chats |
| `messages.migrateChat` | Migrate to supergroup |
| `messages.deleteChat` | Delete chat |
| `messages.getMessageReadParticipants` | Who read |

#### Drafts

| Method | Description |
|--------|-------------|
| `messages.saveDraft` | Save draft |
| `messages.getAllDrafts` | All drafts |
| `messages.clearAllDrafts` | Clear all drafts |

#### Secret Chats (E2E Encrypted)

| Method | Description |
|--------|-------------|
| `messages.requestEncryption` | Request secret chat |
| `messages.acceptEncryption` | Accept secret chat |
| `messages.discardEncryption` | Close secret chat |
| `messages.sendEncrypted` | Send encrypted message |
| `messages.sendEncryptedFile` | Send encrypted file |
| `messages.sendEncryptedService` | Send encrypted service msg |
| `messages.setEncryptedTyping` | Encrypted typing |
| `messages.readEncryptedHistory` | Read encrypted history |
| `messages.getDhConfig` | Diffie-Hellman config |
| `messages.receivedQueue` | Received queue |

#### Reactions

| Method | Description |
|--------|-------------|
| `messages.sendReaction` | Send reaction |
| `messages.sendPaidReaction` | Send paid reaction |
| `messages.getMessagesReactions` | Message reactions |
| `messages.getMessageReactionsList` | Reactors list |
| `messages.getAvailableReactions` | Available reactions |
| `messages.getUnreadReactions` | Unread reactions |
| `messages.readReactions` | Mark reactions read |
| `messages.setChatAvailableReactions` | Set chat reactions |
| `messages.setDefaultReaction` | Default reaction |
| `messages.getTopReactions` | Top reactions |
| `messages.getRecentReactions` | Recent reactions |
| `messages.clearRecentReactions` | Clear recent reactions |
| `messages.togglePaidReactionPrivacy` | Paid reaction privacy |
| `messages.getPaidReactionPrivacy` | Get privacy setting |

#### Stickers & GIFs

| Method | Description |
|--------|-------------|
| `messages.getAllStickers` | All sticker sets |
| `messages.getStickerSet` | Single sticker set |
| `messages.getStickers` | Search stickers |
| `messages.searchStickerSets` | Search sticker sets |
| `messages.searchStickers` | Search stickers |
| `messages.installStickerSet` | Install set |
| `messages.uninstallStickerSet` | Uninstall set |
| `messages.reorderStickerSets` | Reorder sets |
| `messages.toggleStickerSets` | Toggle sets |
| `messages.getArchivedStickers` | Archived sets |
| `messages.getFeaturedStickers` | Featured sets |
| `messages.getOldFeaturedStickers` | Old featured sets |
| `messages.readFeaturedStickers` | Mark featured read |
| `messages.getRecentStickers` | Recent stickers |
| `messages.saveRecentSticker` | Save recent sticker |
| `messages.clearRecentStickers` | Clear recent stickers |
| `messages.getFavedStickers` | Favorite stickers |
| `messages.faveSticker` | Favorite a sticker |
| `messages.getMaskStickers` | Mask stickers |
| `messages.getAttachedStickers` | Stickers on media |
| `messages.getSavedGifs` | Saved GIFs |
| `messages.saveGif` | Save GIF |
| `messages.getMyStickers` | My stickers |
| `messages.searchEmojiStickerSets` | Search emoji sets |

#### Emojis & Effects

| Method | Description |
|--------|-------------|
| `messages.getEmojiKeywords` | Emoji keywords |
| `messages.getEmojiKeywordsDifference` | Keywords diff |
| `messages.getEmojiKeywordsLanguages` | Keywords languages |
| `messages.getEmojiURL` | Emoji URL |
| `messages.getCustomEmojiDocuments` | Custom emoji docs |
| `messages.getEmojiStickers` | Emoji stickers |
| `messages.getFeaturedEmojiStickers` | Featured emoji stickers |
| `messages.searchCustomEmoji` | Search custom emoji |
| `messages.getEmojiStickerGroups` | Sticker groups |
| `messages.getEmojiGroups` | Emoji groups |
| `messages.getEmojiStatusGroups` | Status groups |
| `messages.getEmojiProfilePhotoGroups` | Profile photo groups |
| `messages.getAvailableEffects` | Available effects |

#### Bots & Inline

| Method | Description |
|--------|-------------|
| `messages.startBot` | Start a bot |
| `messages.getInlineBotResults` | Inline results |
| `messages.setInlineBotResults` | Set inline results |
| `messages.getBotCallbackAnswer` | Callback answer |
| `messages.setBotCallbackAnswer` | Set callback answer |
| `messages.getBotApp` | Get mini-app |
| `messages.getWebPage` | Web page info |
| `messages.getWebPagePreview` | URL preview |

#### Web Views / Mini Apps

| Method | Description |
|--------|-------------|
| `messages.requestWebView` | Open webview |
| `messages.prolongWebView` | Prolong webview |
| `messages.requestSimpleWebView` | Simple webview |
| `messages.sendWebViewResultMessage` | WebView result |
| `messages.requestMainWebView` | Main webview |
| `messages.requestAppWebView` | App webview |

#### Translation

| Method | Description |
|--------|-------------|
| `messages.translateText` | Translate text |
| `messages.togglePeerTranslations` | Toggle translation |

#### Dialog Filters / Folders

| Method | Description |
|--------|-------------|
| `messages.getDialogFilters` | List filters |
| `messages.getSuggestedDialogFilters` | Suggested filters |
| `messages.updateDialogFilter` | Update filter |
| `messages.updateDialogFiltersOrder` | Reorder filters |
| `messages.toggleDialogFilterTags` | Toggle filter tags |

#### Saved Messages

| Method | Description |
|--------|-------------|
| `messages.getSavedDialogs` | Saved dialogs |
| `messages.getSavedDialogsByID` | By ID |
| `messages.getPinnedSavedDialogs` | Pinned saved |
| `messages.getSavedHistory` | Saved history |
| `messages.deleteSavedHistory` | Delete saved history |
| `messages.readSavedHistory` | Read saved history |
| `messages.toggleSavedDialogPin` | Pin saved dialog |
| `messages.reorderPinnedSavedDialogs` | Reorder pinned |
| `messages.getSavedReactionTags` | Reaction tags |
| `messages.updateSavedReactionTag` | Update tag |
| `messages.getDefaultTagReactions` | Default tags |

#### Quick Replies

| Method | Description |
|--------|-------------|
| `messages.getQuickReplies` | Quick replies |
| `messages.reorderQuickReplies` | Reorder |
| `messages.checkQuickReplyShortcut` | Check shortcut |
| `messages.editQuickReplyShortcut` | Edit shortcut |
| `messages.deleteQuickReplyShortcut` | Delete shortcut |
| `messages.getQuickReplyMessages` | QR messages |
| `messages.sendQuickReplyMessages` | Send QR |
| `messages.deleteQuickReplyMessages` | Delete QR messages |

#### Games

| Method | Description |
|--------|-------------|
| `messages.setGameScore` | Set game score |
| `messages.setInlineGameScore` | Set inline game score |
| `messages.getGameHighScores` | High scores |
| `messages.getInlineGameHighScores` | Inline high scores |

#### Sponsored Content

| Method | Description |
|--------|-------------|
| `messages.viewSponsoredMessage` | View ad |
| `messages.clickSponsoredMessage` | Click ad |
| `messages.getSponsoredMessages` | Get ads |

#### Fact Check

| Method | Description |
|--------|-------------|
| `messages.editFactCheck` | Edit fact check |
| `messages.deleteFactCheck` | Delete fact check |
| `messages.getFactCheck` | Get fact check |

#### Voice Transcription

| Method | Description |
|--------|-------------|
| `messages.transcribeAudio` | Transcribe audio |
| `messages.rateTranscribedAudio` | Rate transcription |

#### URL Auth

| Method | Description |
|--------|-------------|
| `messages.requestUrlAuth` | Request URL auth |
| `messages.acceptUrlAuth` | Accept URL auth |

#### Extended Media & Inline

| Method | Description |
|--------|-------------|
| `messages.getExtendedMedia` | Extended media |
| `messages.savePreparedInlineMessage` | Save prepared inline |
| `messages.getPreparedInlineMessage` | Get prepared inline |

#### Misc

| Method | Description |
|--------|-------------|
| `messages.setChatTheme` | Set chat theme |
| `messages.uploadMedia` | Upload media |
| `messages.uploadEncryptedFile` | Upload encrypted file |
| `messages.getDocumentByHash` | Document by hash |
| `messages.deletePhoneCallHistory` | Delete call history |
| `messages.toggleSuggestedPostApproval` | Post approval |
| `messages.toggleTodoCompleted` | Toggle todo |
| `messages.appendTodoList` | Append todo list |

### channels (~58)

| Method | Description |
|--------|-------------|
| `channels.createChannel` | Create channel/supergroup |
| `channels.deleteChannel` | Delete channel |
| `channels.editTitle` | Edit title |
| `channels.editPhoto` | Edit photo |
| `channels.editAdmin` | Edit admin rights |
| `channels.editBanned` | Ban/unban |
| `channels.editCreator` | Transfer ownership |
| `channels.editLocation` | Edit location |
| `channels.getChannels` | Get channels |
| `channels.getFullChannel` | Full channel info |
| `channels.getMessages` | Channel messages |
| `channels.getParticipant` | Single participant |
| `channels.getParticipants` | List participants |
| `channels.inviteToChannel` | Invite users |
| `channels.joinChannel` | Join channel |
| `channels.leaveChannel` | Leave channel |
| `channels.deleteMessages` | Delete messages |
| `channels.deleteHistory` | Delete history |
| `channels.deleteParticipantHistory` | Delete member history |
| `channels.readHistory` | Mark read |
| `channels.readMessageContents` | Mark content read |
| `channels.reportSpam` | Report spam |
| `channels.getAdminLog` | Admin log |
| `channels.getAdminedPublicChannels` | My public channels |
| `channels.getInactiveChannels` | Inactive channels |
| `channels.getGroupsForDiscussion` | Discussion groups |
| `channels.setDiscussionGroup` | Link discussion group |
| `channels.setStickers` | Set sticker set |
| `channels.setEmojiStickers` | Set emoji stickers |
| `channels.exportMessageLink` | Message link |
| `channels.togglePreHistoryHidden` | Toggle pre-history |
| `channels.toggleSignatures` | Toggle signatures |
| `channels.toggleSlowMode` | Slow mode |
| `channels.toggleParticipantsHidden` | Hide members |
| `channels.toggleJoinToSend` | Join to send |
| `channels.toggleJoinRequest` | Join request |
| `channels.toggleForum` | Forum mode |
| `channels.toggleViewForumAsMessages` | Forum/messages view |
| `channels.toggleAutotranslation` | Auto-translation |
| `channels.convertToGigagroup` | Convert to broadcast group |
| `channels.restrictSponsoredMessages` | Restrict ads |
| `channels.updateColor` | Update color |
| `channels.updateEmojiStatus` | Channel emoji status |
| `channels.reorderUsernames` | Reorder usernames |
| `channels.toggleUsername` | Toggle username |
| `channels.deactivateAllUsernames` | Deactivate all usernames |
| `channels.createForumTopic` | Create forum topic |
| `channels.getForumTopics` | List forum topics |
| `channels.getForumTopicsByID` | Topics by ID |
| `channels.editForumTopic` | Edit topic |
| `channels.updatePinnedForumTopic` | Pin topic |
| `channels.reorderPinnedForumTopics` | Reorder pinned topics |
| `channels.deleteTopicHistory` | Delete topic history |
| `channels.setMainProfileTab` | Main profile tab |
| `channels.updatePaidMessagesPrice` | Paid messages price |
| `channels.getChannelRecommendations` | Recommendations |
| `channels.getMessageAuthor` | Message author |
| `channels.setBoostsToUnblockRestrictions` | Boosts to unblock |

### users (5)

| Method | Description |
|--------|-------------|
| `users.getUsers` | Get users |
| `users.getFullUser` | Full user info |
| `users.setSecureValueErrors` | Passport errors |
| `users.getSavedMusic` | Saved music |
| `users.getSavedMusicByID` | Saved music by ID |

### contacts (18)

| Method | Description |
|--------|-------------|
| `contacts.getContacts` | List contacts |
| `contacts.importContacts` | Import contacts |
| `contacts.deleteContacts` | Delete contacts |
| `contacts.deleteByPhones` | Delete by phone |
| `contacts.search` | Search |
| `contacts.resolveUsername` | Resolve username |
| `contacts.block` | Block user |
| `contacts.unblock` | Unblock user |
| `contacts.getBlocked` | List blocked |
| `contacts.getTopPeers` | Top peers |
| `contacts.resetTopPeerRating` | Reset rating |
| `contacts.toggleTopPeers` | Toggle top peers |
| `contacts.getSaved` | Saved contacts |
| `contacts.resetSaved` | Reset saved |
| `contacts.getBirthdays` | Birthdays |
| `contacts.exportContactToken` | Contact token |
| `contacts.importContactToken` | Import token |
| `contacts.getSponsoredPeers` | Sponsored peers |

### photos (5)

| Method | Description |
|--------|-------------|
| `photos.uploadProfilePhoto` | Upload profile photo |
| `photos.updateProfilePhoto` | Change profile photo |
| `photos.deletePhotos` | Delete photos |
| `photos.getUserPhotos` | User photos |
| `photos.uploadContactProfilePhoto` | Contact profile photo |

### upload (8)

| Method | Description |
|--------|-------------|
| `upload.saveFilePart` | Save file part |
| `upload.saveBigFilePart` | Save big file part |
| `upload.getFile` | Download file |
| `upload.getFileHashes` | File hashes |
| `upload.getWebFile` | Web file |
| `upload.getCdnFile` | CDN file |
| `upload.getCdnFileHashes` | CDN hashes |
| `upload.reuploadCdnFile` | Re-upload CDN |

### phone (~32)

| Method | Description |
|--------|-------------|
| `phone.requestCall` | Initiate call |
| `phone.acceptCall` | Accept call |
| `phone.confirmCall` | Confirm call |
| `phone.discardCall` | Hang up |
| `phone.receivedCall` | Confirm receipt |
| `phone.getCallConfig` | Call config |
| `phone.saveCallDebug` | Save debug |
| `phone.saveCallLog` | Save log |
| `phone.setCallRating` | Rate call |
| `phone.sendSignalingData` | Signaling data |
| `phone.createConferenceCall` | Create conference |
| `phone.deleteConferenceCallParticipants` | Remove conference participants |
| `phone.sendConferenceCallBroadcast` | Conference broadcast |
| `phone.inviteConferenceCallParticipant` | Invite to conference |
| `phone.declineConferenceCallInvite` | Decline conference |
| `phone.joinGroupCall` | Join group call |
| `phone.leaveGroupCall` | Leave group call |
| `phone.inviteToGroupCall` | Invite to group call |
| `phone.discardGroupCall` | End group call |
| `phone.toggleGroupCallSettings` | Group call settings |
| `phone.getGroupCall` | Get group call |
| `phone.getGroupParticipants` | Call participants |
| `phone.checkGroupCall` | Check group call |
| `phone.toggleGroupCallRecord` | Record group call |
| `phone.editGroupCallParticipant` | Edit participant |
| `phone.editGroupCallTitle` | Edit call title |
| `phone.getGroupCallJoinAs` | Join-as options |
| `phone.exportGroupCallInvite` | Call invite link |
| `phone.toggleGroupCallStartSubscription` | Start subscription |
| `phone.startScheduledGroupCall` | Start scheduled call |
| `phone.saveDefaultGroupCallJoinAs` | Default join-as |
| `phone.getGroupCallChainBlocks` | Chain blocks |

### stories (~32)

| Method | Description |
|--------|-------------|
| `stories.canSendStory` | Can send story |
| `stories.sendStory` | Publish story |
| `stories.editStory` | Edit story |
| `stories.deleteStories` | Delete stories |
| `stories.togglePinned` | Pin story |
| `stories.togglePinnedToTop` | Pin to top |
| `stories.getAllStories` | All stories |
| `stories.getPinnedStories` | Pinned stories |
| `stories.getStoriesArchive` | Archive |
| `stories.getStoriesByID` | By ID |
| `stories.toggleAllStoriesHidden` | Hide all |
| `stories.readStories` | Mark read |
| `stories.incrementStoryViews` | Increment views |
| `stories.getStoryViewsList` | Views list |
| `stories.getStoryReactionsList` | Reactions list |
| `stories.getStoriesViews` | Views stats |
| `stories.exportStoryLink` | Story link |
| `stories.report` | Report story |
| `stories.activateStealthMode` | Stealth mode |
| `stories.getPeerStories` | Peer stories |
| `stories.getAllReadPeerStories` | Read peer stories |
| `stories.getPeerMaxIDs` | Max IDs |
| `stories.getChatsToSend` | Chats to send |
| `stories.togglePeerStoriesHidden` | Hide peer stories |
| `stories.sendReaction` | React to story |
| `stories.searchPosts` | Search posts |
| `stories.createAlbum` | Create album |
| `stories.updateAlbum` | Update album |
| `stories.reorderAlbums` | Reorder albums |
| `stories.deleteAlbum` | Delete album |
| `stories.getAlbums` | Get albums |
| `stories.getAlbumStories` | Album stories |

### stickers (11)

| Method | Description |
|--------|-------------|
| `stickers.createStickerSet` | Create sticker set |
| `stickers.addStickerToSet` | Add sticker |
| `stickers.removeStickerFromSet` | Remove sticker |
| `stickers.changeStickerPosition` | Change position |
| `stickers.changeSticker` | Modify sticker |
| `stickers.setStickerSetThumb` | Set thumbnail |
| `stickers.renameStickerSet` | Rename set |
| `stickers.deleteStickerSet` | Delete set |
| `stickers.replaceSticker` | Replace sticker |
| `stickers.checkShortName` | Check short name |
| `stickers.suggestShortName` | Suggest short name |

### bots (~25)

| Method | Description |
|--------|-------------|
| `bots.setBotCommands` | Set commands |
| `bots.resetBotCommands` | Reset commands |
| `bots.getBotCommands` | Get commands |
| `bots.setBotMenuButton` | Menu button |
| `bots.getBotMenuButton` | Get menu button |
| `bots.setBotInfo` | Set bot info |
| `bots.getBotInfo` | Get bot info |
| `bots.answerWebhookJSONQuery` | Webhook response |
| `bots.canSendMessage` | Can send |
| `bots.allowSendMessage` | Allow sending |
| `bots.invokeWebViewCustomMethod` | Custom WebView method |
| `bots.checkDownloadFileParams` | Check download params |
| `bots.getPopularAppBots` | Popular bots |
| `bots.addPreviewMedia` | Add preview |
| `bots.editPreviewMedia` | Edit preview |
| `bots.deletePreviewMedia` | Delete preview |
| `bots.reorderPreviewMedias` | Reorder previews |
| `bots.getPreviewInfo` | Preview info |
| `bots.getPreviewMedias` | Preview medias |
| `bots.reorderUsernames` | Reorder bot usernames |
| `bots.toggleUsername` | Toggle bot username |
| `bots.updateStarRefProgram` | Star ref program |
| `bots.setCustomVerification` | Custom verification |
| `bots.getBotRecommendations` | Recommendations |
| `bots.updateUserEmojiStatus` | User emoji status |
| `bots.toggleUserEmojiStatusPermission` | Emoji permission |

### payments (~55)

| Method | Description |
|--------|-------------|
| `payments.getPaymentForm` | Payment form |
| `payments.getPaymentReceipt` | Payment receipt |
| `payments.validateRequestedInfo` | Validate info |
| `payments.sendPaymentForm` | Send payment |
| `payments.getSavedInfo` | Saved info |
| `payments.clearSavedInfo` | Clear saved info |
| `payments.getStarsTopupOptions` | Stars top-up options |
| `payments.getStarsStatus` | Stars status |
| `payments.getStarsTransactions` | Stars transactions |
| `payments.getStarsTransactionsByID` | Transactions by ID |
| `payments.sendStarsForm` | Send Stars |
| `payments.refundStarsCharge` | Refund Stars |
| `payments.getStarsRevenueStats` | Revenue stats |
| `payments.getStarsRevenueWithdrawalUrl` | Withdrawal URL |
| `payments.getStarsRevenueAdsAccountUrl` | Ads account URL |
| `payments.getStarsGiftOptions` | Gift options |
| `payments.getStarsSubscriptions` | Stars subscriptions |
| `payments.changeStarsSubscription` | Change subscription |
| `payments.fulfillStarsSubscription` | Fulfill subscription |
| `payments.botCancelStarsSubscription` | Cancel subscription |
| `payments.getStarGifts` | Star gifts |
| `payments.saveStarGift` | Save gift |
| `payments.convertStarGift` | Convert gift |
| `payments.upgradeStarGift` | Upgrade gift |
| `payments.transferStarGift` | Transfer gift |
| `payments.getUniqueStarGift` | Unique gift |
| `payments.getSavedStarGifts` | Saved gifts |
| `payments.getSavedStarGift` | Single saved gift |
| `payments.getStarGiftUpgradePreview` | Upgrade preview |
| `payments.getStarGiftWithdrawalUrl` | Gift withdrawal URL |
| `payments.toggleChatStarGiftNotifications` | Gift notifications |
| `payments.toggleStarGiftsPinnedToTop` | Pin gifts |
| `payments.getResaleStarGifts` | Resale gifts |
| `payments.updateStarGiftPrice` | Gift price |
| `payments.getUniqueStarGiftValueInfo` | Gift value info |
| `payments.checkCanSendGift` | Can send gift |
| `payments.createStarGiftCollection` | Create collection |
| `payments.updateStarGiftCollection` | Update collection |
| `payments.reorderStarGiftCollections` | Reorder collections |
| `payments.deleteStarGiftCollection` | Delete collection |
| `payments.getStarGiftCollections` | Get collections |
| `payments.getPremiumGiftCodeOptions` | Premium gift code options |
| `payments.checkGiftCode` | Check gift code |
| `payments.applyGiftCode` | Apply gift code |
| `payments.getGiveawayInfo` | Giveaway info |
| `payments.launchPrepaidGiveaway` | Launch giveaway |
| `payments.getStarsGiveawayOptions` | Giveaway options |
| `payments.getConnectedStarRefBots` | Connected ref bots |
| `payments.getConnectedStarRefBot` | Single ref bot |
| `payments.getSuggestedStarRefBots` | Suggested ref bots |
| `payments.connectStarRefBot` | Connect ref bot |
| `payments.editConnectedStarRefBot` | Edit ref bot |
| `payments.assignAppStoreTransaction` | App Store tx |
| `payments.assignPlayMarketTransaction` | Play Market tx |
| `payments.canPurchaseStore` | Can purchase |

### stats (7)

| Method | Description |
|--------|-------------|
| `stats.getBroadcastStats` | Channel stats |
| `stats.getMegagroupStats` | Supergroup stats |
| `stats.getMessageStats` | Message stats |
| `stats.getStoryStats` | Story stats |
| `stats.getMessagePublicForwards` | Public forwards (msg) |
| `stats.getStoryPublicForwards` | Public forwards (story) |
| `stats.loadAsyncGraph` | Load graph |

### help (~23)

| Method | Description |
|--------|-------------|
| `help.getConfig` | Telegram config |
| `help.getNearestDc` | Nearest DC |
| `help.getAppConfig` | App config |
| `help.getAppUpdate` | App update |
| `help.getInviteText` | Invite text |
| `help.getSupport` | Support |
| `help.getSupportName` | Support name |
| `help.getCountriesList` | Countries list |
| `help.getTermsOfServiceUpdate` | ToS update |
| `help.acceptTermsOfService` | Accept ToS |
| `help.dismissSuggestion` | Dismiss suggestion |
| `help.saveAppLog` | App log |
| `help.getPromoData` | Promo data |
| `help.hidePromoData` | Hide promo |
| `help.getPremiumPromo` | Premium promo |
| `help.getDeepLinkInfo` | Deep link info |
| `help.getRecentMeUrls` | Recent t.me URLs |
| `help.getCdnConfig` | CDN config |
| `help.getPeerColors` | Peer colors |
| `help.getPeerProfileColors` | Profile colors |
| `help.getPassportConfig` | Passport config |
| `help.editUserInfo` | Edit user info |
| `help.getUserInfo` | Get user info |

### updates (3)

| Method | Description |
|--------|-------------|
| `updates.getState` | Get update state |
| `updates.getDifference` | Get updates diff |
| `updates.getChannelDifference` | Channel updates diff |

### premium (5)

| Method | Description |
|--------|-------------|
| `premium.getBoostsList` | Boosts list |
| `premium.getMyBoosts` | My boosts |
| `premium.applyBoost` | Apply boost |
| `premium.getBoostsStatus` | Boosts status |
| `premium.getUserBoosts` | User boosts |

### chatlists (11)

| Method | Description |
|--------|-------------|
| `chatlists.exportChatlistInvite` | Export chatlist invite |
| `chatlists.deleteExportedInvite` | Delete invite |
| `chatlists.editExportedInvite` | Edit invite |
| `chatlists.getExportedInvites` | List invites |
| `chatlists.checkChatlistInvite` | Check invite |
| `chatlists.joinChatlistInvite` | Join chatlist |
| `chatlists.getChatlistUpdates` | Chatlist updates |
| `chatlists.joinChatlistUpdates` | Join updates |
| `chatlists.hideChatlistUpdates` | Hide updates |
| `chatlists.getLeaveChatlistSuggestions` | Leave suggestions |
| `chatlists.leaveChatlist` | Leave chatlist |

### folders (1)

| Method | Description |
|--------|-------------|
| `folders.editPeerFolders` | Edit peer folders |

### fragments (1)

| Method | Description |
|--------|-------------|
| `fragments.getCollectibleInfo` | Collectible info |

### smsjobs (7)

| Method | Description |
|--------|-------------|
| `smsjobs.isEligibleToJoin` | Eligible to join |
| `smsjobs.join` | Join SMS jobs |
| `smsjobs.leave` | Leave SMS jobs |
| `smsjobs.updateSettings` | Update settings |
| `smsjobs.getStatus` | Get status |
| `smsjobs.getSmsJob` | Get SMS job |
| `smsjobs.finishJob` | Finish job |

### Special Invocation Wrappers

| Method | Description |
|--------|-------------|
| `Api.initConnection` | Init connection wrapper |
| `Api.invokeAfterMsg` | Invoke after message |
| `Api.invokeAfterMsgs` | Invoke after messages |
| `Api.invokeWithLayer` | Invoke with layer |
| `Api.invokeWithoutUpdates` | Invoke without updates |
| `Api.invokeWithBusinessConnection` | Invoke with business connection |
| `Api.invokeWithGooglePlayIntegrity` | Invoke with Google Play |
| `Api.invokeWithApnsSecret` | Invoke with APNS |
| `Api.invokeWithReCaptcha` | Invoke with reCAPTCHA |

---

## 3. Event Builders

```typescript
import { NewMessage, CallbackQuery, EditedMessage, DeletedMessage, Album, Raw } from "telegram/events"
```

| Event | Key Properties | Description |
|-------|---------------|-------------|
| `NewMessage` | `message`, `chatId`, `senderId`, `isPrivate`, `isGroup`, `isChannel` | New message received |
| `EditedMessage` | same as NewMessage | Message was edited |
| `DeletedMessage` | `deletedIds`, `chatId` | Message was deleted |
| `CallbackQuery` | `query`, `data`, `chatId`, `senderId`, `messageId` | Inline button clicked |
| `Album` | `messages[]` | Media album received |
| `Raw` | raw `Api.TypeUpdate` object | Unprocessed update |

### Event Filter Options (NewMessage example)

```typescript
new NewMessage({
  chats?: EntityLike[],        // Filter by chat
  func?: (event) => boolean,   // Custom filter function
  incoming?: boolean,          // Incoming only
  outgoing?: boolean,          // Outgoing only
  fromUsers?: EntityLike[],    // Filter by sender
  forwards?: boolean,          // Forwarded only
  pattern?: RegExp,            // Regex pattern match
  blacklistChats?: boolean,    // Blacklist mode for chats
})
```

---

## 4. CustomMessage Properties & Methods

### Properties

```typescript
message.text           // Message text (alias: message.message)
message.rawText        // Text without formatting
message.chatId         // Chat ID (BigInt)
message.senderId       // Sender ID (BigInt)
message.id             // Message ID
message.date           // Unix timestamp
message.isPrivate      // Is from private chat
message.isGroup        // Is from group
message.isChannel      // Is from channel
message.chat           // Chat entity (lazy)
message.sender         // Sender entity (lazy)
message.replyToMsgId   // Reply-to message ID
message.forwardInfo    // Forward info (if forwarded)
message.buttons        // Inline buttons (if any)
message.buttonCount    // Number of button rows
message.file           // Media file (if any)
message.photo          // Photo (if present)
message.document       // Document (if present)
message.video          // Video (if present)
message.audio          // Audio (if present)
message.voice          // Voice (if present)
message.sticker        // Sticker (if present)
message.gif            // GIF/animation (if present)
message.contact        // Contact (if present)
message.game           // Game (if present)
message.poll           // Poll (if present)
message.invoice        // Invoice (if present)
message.webPreview     // Web page preview (if any)
message.entities       // Message entities (formatting)
message.mediaUnread    // Media unread flag
message.out            // Is outgoing
message.mentioned      // User was mentioned
message.pinned         // Is pinned
message.grouped_id     // Album group ID
```

### Methods

```typescript
await message.respond({ message: "text" })         // Send response to chat
await message.reply({ message: "text" })            // Reply to this message
await message.forward(entity)                       // Forward message
await message.edit({ text: "new text" })            // Edit message
await message.delete({ revoke: true })              // Delete message
await message.pin()                                 // Pin message
await message.download()                            // Download media
await message.markAsRead()                          // Mark as read
await message.click(buttonIndex?)                   // Click inline button
```

---

## 5. Dialog Properties & Methods

### Properties

```typescript
dialog.dialog          // Api.Dialog object
dialog.name            // Dialog name/title (alias: dialog.title)
dialog.id              // Dialog ID (peer ID)
dialog.entity          // Chat/User/Channel entity
dialog.message         // Last message
dialog.date            // Date of last message
dialog.unreadCount     // Unread messages count
dialog.unreadMentionsCount // Unread mentions count
dialog.isUser          // Is private chat
dialog.isGroup         // Is group chat
dialog.isChannel       // Is channel
dialog.archived        // Is archived
dialog.pinned          // Is pinned
```

### Methods

```typescript
await dialog.sendMessage({ message: "text" })
await dialog.delete()
```

---

## 6. Button Types

### Inline Keyboard Buttons

```typescript
new Api.KeyboardButtonUrl({ text, url })
new Api.KeyboardButtonCallback({ text, data: Buffer })
new Api.KeyboardButtonSwitchInline({ text, query, samePeer? })
new Api.KeyboardButtonGame({ text })
new Api.KeyboardButtonBuy({ text })
new Api.KeyboardButtonUrlAuth({ text, url, buttonId })
new Api.KeyboardButtonUserProfile({ text, userId })
new Api.KeyboardButtonWebView({ text, url })
new Api.KeyboardButtonSimpleWebView({ text, url })
new Api.KeyboardButtonRequestPeer({ text, buttonId, peerType })
new Api.InputKeyboardButtonUrlAuth({ text, url, bot, requestWriteAccess? })
new Api.InputKeyboardButtonUserProfile({ text, userId })
```

### Reply Keyboard Buttons

```typescript
new Api.KeyboardButton({ text })
new Api.KeyboardButtonRequestPhone({ text })
new Api.KeyboardButtonRequestGeoLocation({ text })
new Api.KeyboardButtonRequestPoll({ text, quiz? })
```

### Markup Wrappers

```typescript
new Api.ReplyInlineMarkup({ rows: [new Api.KeyboardButtonRow({ buttons })] })
new Api.ReplyKeyboardMarkup({ rows, resize?, singleUse?, selective?, placeholder? })
new Api.ReplyKeyboardHide({ selective? })
new Api.ReplyKeyboardForceReply({ singleUse?, selective?, placeholder? })
```

---

## 7. Utility Functions

```typescript
import { utils } from "telegram"

// Entity/Peer utilities
utils.getPeer(entity)
utils.getPeerId(peer, addMark?)
utils.resolveId(peerId)
utils.getInputPeer(entity)
utils.getDisplayName(entity)

// ID utilities
utils.parseID(id)
utils.parseUsername(username)
utils.getMessageId(message)

// Binary utilities
utils.readBigIntFromBuffer(buffer, little, signed)
utils.readBufferFromBigInt(bigInt, bytesNumber, little, signed)

// File utilities
utils.getAppropriatedPartSize(fileSize)

// Misc
utils.generateRandomBytes(count)
utils.generateRandomLong()
utils.sleep(ms)
utils.mod(n, m)
```

---

## Summary

| Category | Count |
|----------|-------|
| Client high-level | ~47 |
| `auth` | 22 |
| `account` | ~75 |
| `messages` | ~130 |
| `channels` | ~58 |
| `users` | 5 |
| `contacts` | 18 |
| `photos` | 5 |
| `upload` | 8 |
| `phone` | ~32 |
| `stories` | ~32 |
| `stickers` | 11 |
| `bots` | ~25 |
| `payments` | ~55 |
| `stats` | 7 |
| `help` | ~23 |
| `chatlists` | 11 |
| `premium` | 5 |
| `updates` | 3 |
| `folders` | 1 |
| `fragments` | 1 |
| `smsjobs` | 7 |
| Special wrappers | 9 |
| **TOTAL** | **~550+** |
