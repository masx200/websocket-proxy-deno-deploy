import { proxy_tcp_over_websocket } from "./proxy_tcp_over_websocket.ts";
import { readBytesWithBYOBReader } from "./readBytesWithBYOBReader.ts";

/**
 *https://www.rfc-editor.org/rfc/rfc1928
 */
export async function socks5_server_second(conn: Deno.Conn) {
    const writer = conn.writable.getWriter();

    //Requests
    const [VER, CMD, RSV, ATYP] = await readBytesWithBYOBReader(
        conn.readable,
        4
    );
    //   o  CMD
    //          o  CONNECT X'01'
    //          o  BIND X'02'
    //          o  UDP ASSOCIATE X'03'
    //    ATYP   address type of following address
    //          o  IP V4 address: X'01'
    //          o  DOMAINNAME: X'03'
    //          o  IP V6 address: X'04'
    // Addressing

    // In an address field (DST.ADDR, BND.ADDR), the ATYP field specifies
    // the type of address contained within the field:

    //        o  X'01'

    // the address is a version-4 IP address, with a length of 4 octets

    //        o  X'03'

    // the address field contains a fully-qualified domain name.  The first
    // octet of the address field contains the number of octets of name that
    // follow, there is no terminating NUL octet.

    //        o  X'04'

    // the address is a version-6 IP address, with a length of 16 octets.
    const address_length = ATYP === 1 ? 4 : ATYP === 4 ? 16 : 0;
    const address = address_length
        ? await readBytesWithBYOBReader(conn.readable, address_length)
        : await readBytesWithBYOBReader(
              conn.readable,
              (
                  await readBytesWithBYOBReader(conn.readable, 1)
              )[0]
          );
    const raw_address = address_length ? address : [address.length, ...address];
    const port = await readBytesWithBYOBReader(conn.readable, 2);
    if (VER === 0x05 && CMD === 0x01 && RSV === 0x00) {
    } else {
        await writer.write(
            new Uint8Array([5, 7, 0, ATYP, ...raw_address, ...port])
        );
        conn.close();
        return;
    }
    writer.releaseLock();
    await proxy_tcp_over_websocket(conn);
}
