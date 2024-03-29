import { useEffect, useState } from "react";
import { Share } from "react-native";
import { HStack, useToast, VStack } from "native-base";
import { useRoute } from "@react-navigation/native"

import { api } from "../services/api";

import { Header } from "../components/Header";
import { Loading } from "../components/Loading";
import { Guesses } from "../components/Guesses";
import { Option } from "../components/Option";
import { PollCardPros } from "../components/PollCard";
import { PollHeader } from "../components/PollHeader";
import { EmptyMyPollList } from "../components/EmptyMyPollList";

interface RouteParams {
    id: string;
}

export function Details() {
    const [optionSelected, setOptionSelected] = useState<"guesses" | "ranking">("guesses");
    const [isLoading, setIsLoading] = useState(false);
    const [pollDetails, setPollDetails] = useState<PollCardPros>({} as PollCardPros);

    const route = useRoute();
    const { id } = route.params as RouteParams;
    const toast = useToast();


    async function fetchPollDetails() {
        try {
            setIsLoading(true);


            const response = await api.get(`/polls/${id}`);
            setPollDetails(response.data.polls);

        } catch (err) {
            console.log(err)

            toast.show({
                title: 'Erro ao carregar os detalhes.',
                placement: 'top',
                bgColor: 'red.500',
            });

        } finally {
            setIsLoading(false);
        }
    }

    async function handleCodeShare() {
        await Share.share({
            message: pollDetails.code
        });
    }

    useEffect(() => {
        fetchPollDetails();
    }, [id]);

    if (isLoading) {
        return (
            <Loading />
        );
    }

    return (
        <VStack flex={1} bgColor="gray.900">
            <Header
                title={pollDetails.title}
                showBackButton
                showShareButton
                onShare={handleCodeShare}
            />

            {
                pollDetails._count?.participants > 0 ?
                    <VStack px={5} flex={1}>
                        <PollHeader data={pollDetails} />

                        <HStack bgColor="gray.800" p={1} rounded='sm' mb={5}>
                            <Option
                                title="Seus palpites"
                                isSelected={optionSelected === "guesses"}
                                onPress={() => setOptionSelected("guesses")}
                            />
                            <Option
                                title="Ranking do grupo"
                                isSelected={optionSelected === "ranking"}
                                onPress={() => setOptionSelected("ranking")}
                            />
                        </HStack>

                        <Guesses pollId={pollDetails.id} code={pollDetails.code} />
                    </VStack>

                    : <EmptyMyPollList code={pollDetails.code} />
            }

        </VStack>
    );
}