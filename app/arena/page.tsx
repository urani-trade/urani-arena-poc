'use client';

import OrderBatch from '@/components/batch/order-batch'
import { TokenTransferGraph } from '@/components/token-transfer-graph'
import {useEffect, useState} from "react";
import axios from "axios";
import {log} from "next/dist/server/typescript/utils";
import {IBatch, ISolution} from "@/types";
import * as process from "process";

export default function Arena() {

  const [selectedSolutionId, setSelectedSolutionId] = useState<string>('');
  const [selectedBatchId, setSelectedBatchId] = useState<string>('1');
  const [batchData, setBatchData] = useState<IBatch | null>(null);
  const [liveStream,setLiveStream] = useState<boolean>(true);
  

  useEffect(() => {
    fetchBatch(selectedBatchId);
  }, [selectedBatchId]);

  async function fetchBatch (id:string) {
    try {
      const response = await axios.get(
        `http://ec2-18-118-1-69.us-east-2.compute.amazonaws.com/api/batches/${id}`
      );
      setBatchData(response.data);
    } 
    catch (error) {
      console.error('Error:', error);
    }
  };

  
  function onSolutionSelected (id:string) {
    console.log('onSolutionSelected', id);
    setLiveStream(false);
    setSelectedSolutionId(id);
  }

  function onBatchRequested (id:string) {
    console.log('onBatchRequested', id);
    setSelectedSolutionId('');
    setSelectedBatchId(id);
  }

  return (
    <div className="flex flex-col md:flex-row justify-center">
      <div className="relative w-full w-8/10 order-2 md:order-1">
        {
          selectedSolutionId &&
          <button className="absolute left-[25px] top-[16px] flex items-center py-2 px-3 rounded-md transition-colors duration-200 ease-in-out
            bg-white hover:bg-hoverWhite active:bg-hoverWhite focus:outline-none focus:ring-2"
            onClick={setSelectedSolutionId.bind(null, '')}
          >
            <img src="/back-arrow.svg" className="mr-3" alt="" />
            <p
              className="text-backgroundPage"
            >
              Show All Solutions
            </p>
          </button>
        }
        <TokenTransferGraph
          solutions={batchData?.solutions.filter(solution => solution.agent.name === selectedSolutionId || !selectedSolutionId)}
          onSolutionSelected={onSolutionSelected}
        />
      </div>
      <div className="w-2/10 order-1 md:order-2 flex items-start  md:justify-end text-center md:text-left lg:ml-20">
        {
          batchData &&
          <OrderBatch
            onBatchRequested={onBatchRequested}
            batch={batchData as IBatch}
            selectedSolutionId={selectedSolutionId as string}
            onSolutionSelected={onSolutionSelected}
            liveStream={liveStream}
            setLiveStream={setLiveStream}
          />
        }

      </div>
    </div>
  );
}


