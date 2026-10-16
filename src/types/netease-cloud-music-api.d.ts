declare module "NeteaseCloudMusicApi/module/*" {
  type ApiResult = { body: unknown; cookie?: string[] }
  type Request = (...args: unknown[]) => Promise<unknown>
  const operation: (params: Record<string, unknown>, request: Request) => Promise<ApiResult>
  export default operation
}

declare module "NeteaseCloudMusicApi/util/request" {
  const request: (...args: unknown[]) => Promise<unknown>
  export default request
}
