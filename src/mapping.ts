import { near, BigInt } from '@graphprotocol/graph-ts'
import { JSON } from 'json-as'
import { ExecutionOutcome, Receipt } from '../generated/schema'

export function handleReceipt(receiptWithOutcome: near.ReceiptWithOutcome): void {
  const receipt = receiptWithOutcome.receipt
  const block = receiptWithOutcome.block
  const actions = receipt.actions
  for (let i = 0; i < actions.length; i++) {
    handleAction(actions[i], receipt, block.header)
  }

  const outcome = receiptWithOutcome.outcome
  const executionOutcome: ExecutionOutcome = new ExecutionOutcome(receiptWithOutcome.block.header.hash.toBase58())
  executionOutcome.blockHash = receiptWithOutcome.block.header.hash.toBase58()
  executionOutcome.status = outcome.status.toValue().toBase58()

  executionOutcome.save()
}

function handleAction(action: near.ActionValue, receipt: near.ActionReceipt, blockHeader: near.BlockHeader): void {
  const data = action.data
  const kind = action.kind
  const signerId = receipt.signerId
  const hash = blockHeader.hash
  const functionCall = action.kind == near.ActionKind.FUNCTION_CALL ? action.toFunctionCall() : null

  const newReceipt = new Receipt(hash.toBase58())
  newReceipt.kind = kind.toString()
  newReceipt.data = JSON.stringify(data)
  newReceipt.signerId = signerId
  newReceipt.functionName = functionCall ? functionCall.methodName  : ''
  newReceipt.timestamp = BigInt.fromU64(blockHeader.timestampNanosec)

  newReceipt.save()
}
