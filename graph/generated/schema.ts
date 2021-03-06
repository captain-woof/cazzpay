// THIS IS AN AUTOGENERATED FILE. DO NOT EDIT THIS FILE DIRECTLY.

import {
  TypedMap,
  Entity,
  Value,
  ValueKind,
  store,
  Bytes,
  BigInt,
  BigDecimal
} from "@graphprotocol/graph-ts";

export class Seller extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));
  }

  save(): void {
    let id = this.get("id");
    assert(id != null, "Cannot save Seller entity without an ID");
    if (id) {
      assert(
        id.kind == ValueKind.STRING,
        `Entities of type Seller must have an ID of type String but the id '${id.displayData()}' is of type ${id.displayKind()}`
      );
      store.set("Seller", id.toString(), this);
    }
  }

  static load(id: string): Seller | null {
    return changetype<Seller | null>(store.get("Seller", id));
  }

  get id(): string {
    let value = this.get("id");
    return value!.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get email(): string {
    let value = this.get("email");
    return value!.toString();
  }

  set email(value: string) {
    this.set("email", Value.fromString(value));
  }

  get name(): string {
    let value = this.get("name");
    return value!.toString();
  }

  set name(value: string) {
    this.set("name", Value.fromString(value));
  }

  get transactionsReceived(): Array<string> {
    let value = this.get("transactionsReceived");
    return value!.toStringArray();
  }

  set transactionsReceived(value: Array<string>) {
    this.set("transactionsReceived", Value.fromStringArray(value));
  }
}

export class PurchaseTransaction extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));
  }

  save(): void {
    let id = this.get("id");
    assert(id != null, "Cannot save PurchaseTransaction entity without an ID");
    if (id) {
      assert(
        id.kind == ValueKind.STRING,
        `Entities of type PurchaseTransaction must have an ID of type String but the id '${id.displayData()}' is of type ${id.displayKind()}`
      );
      store.set("PurchaseTransaction", id.toString(), this);
    }
  }

  static load(id: string): PurchaseTransaction | null {
    return changetype<PurchaseTransaction | null>(
      store.get("PurchaseTransaction", id)
    );
  }

  get id(): string {
    let value = this.get("id");
    return value!.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get payerWalletAddr(): Bytes {
    let value = this.get("payerWalletAddr");
    return value!.toBytes();
  }

  set payerWalletAddr(value: Bytes) {
    this.set("payerWalletAddr", Value.fromBytes(value));
  }

  get recipientSeller(): string {
    let value = this.get("recipientSeller");
    return value!.toString();
  }

  set recipientSeller(value: string) {
    this.set("recipientSeller", Value.fromString(value));
  }

  get tokenUsedForPurchaseContractAddr(): Bytes {
    let value = this.get("tokenUsedForPurchaseContractAddr");
    return value!.toBytes();
  }

  set tokenUsedForPurchaseContractAddr(value: Bytes) {
    this.set("tokenUsedForPurchaseContractAddr", Value.fromBytes(value));
  }

  get tokenAmtUsedForPurchased(): BigInt {
    let value = this.get("tokenAmtUsedForPurchased");
    return value!.toBigInt();
  }

  set tokenAmtUsedForPurchased(value: BigInt) {
    this.set("tokenAmtUsedForPurchased", Value.fromBigInt(value));
  }

  get fiatAmountPaid(): BigInt {
    let value = this.get("fiatAmountPaid");
    return value!.toBigInt();
  }

  set fiatAmountPaid(value: BigInt) {
    this.set("fiatAmountPaid", Value.fromBigInt(value));
  }

  get fiatAmountToPayToSeller(): BigInt {
    let value = this.get("fiatAmountToPayToSeller");
    return value!.toBigInt();
  }

  set fiatAmountToPayToSeller(value: BigInt) {
    this.set("fiatAmountToPayToSeller", Value.fromBigInt(value));
  }

  get confirmed(): boolean {
    let value = this.get("confirmed");
    return value!.toBoolean();
  }

  set confirmed(value: boolean) {
    this.set("confirmed", Value.fromBoolean(value));
  }

  get timestampOfConfirmation(): BigInt | null {
    let value = this.get("timestampOfConfirmation");
    if (!value || value.kind == ValueKind.NULL) {
      return null;
    } else {
      return value.toBigInt();
    }
  }

  set timestampOfConfirmation(value: BigInt | null) {
    if (!value) {
      this.unset("timestampOfConfirmation");
    } else {
      this.set("timestampOfConfirmation", Value.fromBigInt(<BigInt>value));
    }
  }
}
