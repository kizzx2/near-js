import {
  FinalExecutionOutcome,
  Provider,
} from "near-api-js/lib/providers/provider";
import {
  TransactionBundleSendOptions,
  TransactionSender,
  TransactionSendOptions,
} from "./TransactionSender";

export type ProviderTransactionSenderOptions = {
  /**
   * A NEAR Provider from `near-api-js`. For example, `JsonRpcProvider`.
   */
  provider: Provider;
};

/**
 * This is an implementation of {@link TransactionSender}. It is used to send
 * transactions with a `Provider` from `near-api-js`.
 *
 *
 * @example
 * ```ts
 * const transactionSender = new ProviderTransactionSender({ provider: near.connection.provider })
 * ```
 */
export class ProviderTransactionSender implements TransactionSender {
  private provider: Provider;

  constructor({ provider }: ProviderTransactionSenderOptions) {
    this.provider = provider;
  }

  /**
   * @see {@link TransactionSender.send}
   */
  async send({
    transactionOptions,
    transactionCreator,
    transactionSigner,
  }: TransactionSendOptions): Promise<FinalExecutionOutcome> {
    const transaction = await transactionCreator.create(transactionOptions);
    const signedTransaction = await transactionSigner.sign({ transaction });
    return this.provider.sendTransaction(signedTransaction);
  }

  /**
   * @see {@link TransactionSender.bundleSend}
   */
  async bundleSend({
    bundleTransactionOptions,
    transactionCreator,
    transactionSigner,
  }: TransactionBundleSendOptions): Promise<FinalExecutionOutcome[]> {
    const outcomes: FinalExecutionOutcome[] = [];

    for (let [i, transactionOptions] of bundleTransactionOptions.entries()) {
      outcomes.push(
        await this.send({
          transactionOptions: { ...transactionOptions, nonceOffset: i + 1 },
          transactionCreator,
          transactionSigner,
        })
      );
    }

    return outcomes;
  }
}
