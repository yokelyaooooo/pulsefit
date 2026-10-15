import assert from "node:assert/strict"
import test from "node:test"
import { cookieHeader, isSameOriginRequest, parseCookies, parseQqQrReply, qqHash, trustedQqUrl } from "./auth-data.ts"
import { qqUinFromCookie, readNeteaseAccount, readQqPlaylists } from "./parse.ts"

test("credential parsing preserves equals and rejects header injection", () => {
  const result = parseCookies("Cookie: uin=o12345; qm_keyst=abc==; invalid name=x; unsafe=hi\r\nX: bad")
  assert.deepEqual(result, { uin: "o12345", qm_keyst: "abc==" })
  assert.equal(cookieHeader(result), "uin=o12345; qm_keyst=abc==")
})
test("QQ identity uses the matching login type", () => {
  assert.equal(qqUinFromCookie("uin=o111; wxuin=9999999999999999; login_type=2"), "9999999999999999")
  assert.equal(qqUinFromCookie("uin=o111; wxuin=222; login_type=1"), "111")
})
test("QQ status is parsed without executing returned scripts", () => {
  assert.deepEqual(parseQqQrReply("ptuiCB('66','0','','0','等待扫码','');"), { status: 66, redirect: "", name: "" })
  assert.equal(parseQqQrReply("ptuiCB('0','0','https://ssl.ptlogin2.qq.com/check_sig','0','成功','用户');").name, "用户")
  assert.throws(() => parseQqQrReply("alert('0')"))
  assert.equal(qqHash("abc"), 108966)
})
test("QQ auth redirects stay inside the provider", () => {
  assert.equal(trustedQqUrl("https://ssl.ptlogin2.qq.com/check_sig"), true)
  for (const url of ["https://qq.com.attacker.example/", "http://y.qq.com/", "https://user@qq.com/", "file:///secret"]) assert.equal(trustedQqUrl(url), false)
})
test("account and playlist parsing handles the actual platform envelopes", () => {
  assert.deepEqual(readNeteaseAccount({ data: { profile: { userId: 123, nickname: "测试" } } }), { uid: "123", name: "测试" })
  assert.deepEqual(readNeteaseAccount({ account: { id: 456 } }), { uid: "456", name: "" })
  assert.equal(readQqPlaylists({ data: { disslist: [{ tid: 7654321, dirid: 1, diss_name: "训练" }] } })[0]?.nativeId, "7654321")
})

test("same-origin login accepts the public host behind the development listener", () => {
  assert.equal(isSameOriginRequest(new Request("http://0.0.0.0:41731/api/qq", { headers: { host: "localhost:41731", origin: "http://localhost:41731" } })), true)
  assert.equal(isSameOriginRequest(new Request("http://0.0.0.0:41731/api/qq", { headers: { host: "localhost:41731", origin: "https://attacker.example" } })), false)
  assert.equal(isSameOriginRequest(new Request("http://0.0.0.0:41731/api/qq", { headers: { host: "localhost:41731", origin: "null" } })), false)
})
