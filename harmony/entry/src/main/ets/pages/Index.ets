import { webview } from '@kit.ArkWeb';

@Entry
@Component
struct Index {
  controller: webview.WebviewController = new webview.WebviewController();
  @State pageUrl: string = 'http://127.0.0.1:41731';

  build() {
    Column() {
      Row() {
        TextInput({ text: this.pageUrl, placeholder: '燃律地址' })
          .layoutWeight(1)
          .onChange((value: string) => {
            this.pageUrl = value;
          })
        Button('打开')
          .margin({ left: 8 })
          .onClick(() => {
            this.controller.loadUrl(this.pageUrl);
          })
      }
      .width('100%')
      .padding(12)

      Web({ src: this.pageUrl, controller: this.controller })
        .javaScriptAccess(true)
        .domStorageAccess(true)
        .fileAccess(true)
        .layoutWeight(1)
        .width('100%')
    }
    .width('100%')
    .height('100%')
  }
}
